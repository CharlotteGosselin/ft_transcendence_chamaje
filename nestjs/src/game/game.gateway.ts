import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	OnGatewayConnection,
	WebSocketServer,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/services/prisma-service/prisma.service';
import { GameService } from './game.service';
// import { GameRoomStatus, PlayerGameStatus, gameRoom } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

interface IRoomInformationProps {
	id: number;
	state: string;
}

// interface IGameInformationProps {
// 	gameRoomId: number;
// 	opponentLogin: string;
// 	opponentImage: string;
// }

function decodeToken(client: Socket): any {
	return jwt.verify(
		client.handshake.auth.accessToken,
		process.env.JWT_SECRET_KEY,
	) as jwt.JwtPayload;
}

// TODO:
// - When a player disconnects in the middle of a game, do we make him leave the room ?

@WebSocketGateway({
	path: '/ws/',
})
export class GameGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	// We declare a map of user sockets, each key is a userId that will store
	// all the sockets the user is using to talk to the server
	private userSockets: { [userId: number]: string[] };
	// This will log the socket along with its corresponding userId, so I
	// can easily find who is connected to which socket
	private socketOwners: { [socket: string]: number };

	constructor(
		private readonly prisma: PrismaService,
		private readonly gameService: GameService,
	) {
		this.userSockets = {};
		this.socketOwners = {};
	}

	afterInit(server: Server) {
		console.log('[🦄] Server initialized !');
	}

	// TODO: only allow our user to have one socket at a time ?
	handleConnection(client: Socket, ...args: any[]) {
		console.log('[🟢] Client connected: ', client.id);
		try {
			const decodedPayload = decodeToken(client);
			// Extract our userId from the payload, so we know who's connected
			const userId = decodedPayload.userId;
			console.log(`[🎉] Client token verified for user ${userId}!`);
			client.emit('identification_ok');
			// Add the userId to our map along with they socket identifier
			// This allows to to track all the sockets our user is using to
			// play.
			// if the user does not have an array yet, initialize one
			if (!this.userSockets[userId]) {
				this.userSockets[userId] = [];
			}
			// If our user already has 5 sockets active, we reject their connection
			// it's not the fete ici.
			if (this.userSockets[userId].length === 5) {
				console.log(
					`[❗] User #${userId} already has ${this.userSockets[userId].length} sockets in use, we say NO.`,
				);
				client.emit('connection_limit_reached');
				throw new Error('user reached max connections');
			} else {
				// Add the socket id to the array of sockets for the client
				this.userSockets[userId].push(client.id);
				// Link the socket id to the client Id, so we can find its owner easily
				this.socketOwners[client.id] = userId;
			}
		} catch (error) {
			console.error('Connection error:', error);
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket) {
		// When a client disconnects, we want to set all of their game sessions
		// as waiting, so we can handle reconnection later
		// this.setAllUserGameSessionsTo(123, PlayerGameStatus.Waiting);

		// Remove this socket from the userSockets array
		// so it's not associated with our user anymore
		const socketOwnerId = this.findSocketOwner(client.id);
		// if we were able to locate the owner of the socket
		if (socketOwnerId) {
			// we're replacing the entry at sockerOwnerId with an array of values
			// that do not match the socketId we'd like to remove
			this.userSockets[socketOwnerId] = this.userSockets[socketOwnerId].filter(
				(socketId) => socketId != client.id,
			);
			// if the owner of that socket does not have any more sockets stored,
			// remove their entry entirely, so we don't pollute our array
			if (this.userSockets[socketOwnerId].length === 0)
				delete this.userSockets[socketOwnerId];
		}
		// Also remove that socket from the socketOwners map
		if (client.id in this.socketOwners) delete this.socketOwners[client.id];
		console.log(
			'[🔴] Client %s disconnected from socket %s',
			socketOwnerId,
			client.id,
		);
		if (Object.keys(this.socketOwners).length > 0)
			console.log(
				'[📊] Here are the sockets we are still tracking: ',
				this.socketOwners,
			);
		if (Object.keys(this.userSockets).length > 0)
			console.log(
				'[📊] Here are the users still connected: ',
				this.userSockets,
			);
		else console.log('[📊] There are no more users connected');

		// When a user leaves:
		// - Remove all the rooms they were alone in
		this.gameService.deletePlayerSoloRooms(socketOwnerId);
		// Let their opponents know the user is not ready anymore but might come back
		this.notifyCurrentOpponents(
			client,
			socketOwnerId,
			'opponent-was-disconnected',
		);
	}

	private findSocketOwner(socketId: string): number | null {
		if (socketId in this.socketOwners) return this.socketOwners[socketId];
	}

	private notifyCurrentOpponents(
		socket: Socket,
		userId: number,
		eventTitle: string,
	) {
		// Find all active rooms with opponents
		const activeRoomIds: string[] = this.gameService.getActiveRoomIds(userId);
		// Notify the opponents that we got disconnected
		for (const roomId of activeRoomIds) this.server.in(roomId).emit(eventTitle);
	}

	// This will look for a room for the user, join the room and add them to the corresponding
	// socket room, so they can receive updates. The user will received the roomId so they
	// know how to communicate to it as well.
	@SubscribeMessage('join-room')
	async joinRoom(
		client: any,
		data: { userId: number; opponentId: number | undefined },
	) {
		const { userId, opponentId } = data;
		try {
			let roomId;

			// if user knows they want to play against someone
			if (opponentId) {
			}
			// otherwise, user just wants to play and should be assigned a room
			else {
				console.log('[🏓] User would like to be paired with someone');
				roomId = this.gameService.handleSoloRoomAssignment(userId);
			}
			// Add our player to the target socket room
			client.join(roomId);
			// And let our user know they have joined that room
			client.emit('room-joined', {
				id: roomId,
			});
			// if the room is full, let both players know
			if (this.gameService.isRoomFull(roomId)) {
				this.server.in(roomId).emit('room-is-full');
			}
		} catch (error) {
			console.error('Could not join game room: ', error);
			client.emit('error-joining-room');
		}
	}

	// Send users their opponent's information
	@SubscribeMessage('request-opponent-info')
	async handleOpponentInfoRequest(
		client: any,
		data: { userId: number; roomId: string },
	) {
		const { userId, roomId } = data;
		// Retrieve our opponent's information
		const opponentInformation: { login: string; image: string } =
			await this.gameService.getOpponentInformation(userId, roomId);
		// Send it back to our user
		client.emit('server-opponent-info', opponentInformation);
	}

	// Player notifies that it's ready
	@SubscribeMessage('player-is-ready')
	async handlePlayerIsReady(client: Socket, data: { roomId: string }) {
		console.log(`CURRENT MAP: ${JSON.stringify(this.userSockets, null, 2)}`);
		const { roomId } = data;
		// Notify the other users in the room that their opponent is ready
		client.to(roomId).emit('opponent-is-ready');
	}

	@SubscribeMessage('paddle-movement')
	async handlePaddleUp(
		clientSocket: Socket,
		data: { playerNumber: number; direction: string },
	) {
		const { playerNumber, direction } = data;
		console.log(`[🎮] Player ${playerNumber} moved their paddle ${direction}`);
	}
}
