import { error } from 'console';
import React from 'react';
import { Socket, io } from 'socket.io-client';

type ReactBooleanSeter = React.Dispatch<React.SetStateAction<boolean>>;
type ReactStringSeter = React.Dispatch<React.SetStateAction<string>>;

interface IGameDataProps {
	gameRoomId: number;
	opponentId?: number;
	opponentLogin?: string;
	opponentImage?: string;
}

interface IRoomInformationProps {
	id: number;
	state: string;
}

export class GameSocket {
	// Variables
	private socket: Socket | undefined;
	private userId: number;
	private accessToken: string;
	private currentGameRoomId: number | undefined;

	// Setters
	// These will come from the Game component, and will help us update the
	// Game component with what the server says
	private setPlayer1Ready: ReactBooleanSeter;
	private setPlayer2Ready: ReactBooleanSeter;
	private setGameCanStart: ReactBooleanSeter;
	private setConnectedToServer: ReactBooleanSeter;
	private setConnectionStatus: ReactStringSeter;

	constructor(
		userId: number,
		accessToken: string,
		player1ReadySeter: ReactBooleanSeter,
		player2ReadySeter: ReactBooleanSeter,
		gameCanStartSeter: ReactBooleanSeter,
		connectedToServerSeter: ReactBooleanSeter,
		setConnectionStatus: ReactStringSeter,
	) {
		// Initialize variables
		this.userId = userId;
		this.accessToken = accessToken;

		// Initialize setters
		this.setPlayer1Ready = player1ReadySeter;
		this.setPlayer2Ready = player2ReadySeter;
		this.setGameCanStart = gameCanStartSeter;
		this.setConnectedToServer = connectedToServerSeter;
		this.setConnectionStatus = setConnectionStatus;
	}

	// Try to initiate a socket connection with the server
	initiateSocketConnection() {
		try {
			// Start socket connection
			this.socket = io({
				path: '/ws/',
				reconnection: false,
				auth: { accessToken: this.accessToken },
			});
			// if (!this.connectionSocket) return;
			this.socket.on('connect', () => {
				console.log('Connected to server ! 🔌🟢 ');
			});
			this.socket.on('identification_ok', () => {
				// Notify the game component that we are connected to the server
				this.setConnectedToServer(true);
			});
			this.socket.on('connect_error', (error: Error) => {
				this.setConnectionStatus('Connection error');
			});
			this.socket.on('connect_timeout', () => {
				this.setConnectionStatus('Connection timeout');
			});
			this.socket.on('connection_limit_reached', () => {
				this.setConnectionStatus(
					'Too many connections, please close some tabs and refresh !',
				);
			});
			// Listen for the 'disconnect' event prevent reconnection from wanted disconnection
			this.socket.on('disconnect', (reason) => {
				if (
					reason != 'io client disconnect' &&
					reason != 'io server disconnect'
				) {
					// the disconnection was initiated by the server, you need to reconnect manually
					if (this.socket) this.socket.connect();
				} else {
					// this.endConnection(this.userId);
					if (this.socket) this.socket.disconnect();
				}
			});
		} catch (error) {
			this.setConnectionStatus('Connection failed: ' + error);
			// Throw on error, so the parent component cannot try to interact
			// with the server if they are not connected to it
			throw new Error('Could not connect to server');
		}
	}

	// utility that logs with a custom label
	log(logContent: any) {
		console.log(
			`%c GameSocket %c ${logContent}`,
			'background: purple; color: pink',
			'',
		);
	}

	// join a game room
	joinGameRoom(opponentId?: number) {
		this.log('Asking for a room...');
		try {
			// ask the server to assign us a room
			this.socket?.emit('join-room', {
				userId: this.userId,
				opponentId: opponentId,
			});
			// if the server succeeds
			this.socket?.on('room-joined', (roomInfo: IRoomInformationProps) => {
				this.log(
					`Server put us in room ${roomInfo.id}. Room is ${roomInfo.state}`,
				);
				this.currentGameRoomId = roomInfo.id;
				// TODO: move this ?
				// set the socket to monitor/receive opponent information
				this.socket?.on(`player-information`, () => {
					this.log('Just received the player information :)');
				});
			});
			// if there was an error joining a room
			this.socket?.on('error-joining-room', () => {
				this.log('error joining room');
				throw new Error('error joining room');
			});
		} catch (error) {
			this.setConnectionStatus('Could not join room: ' + error);
		}
	}

	disconnect() {
		this.socket?.disconnect();
	}

	// findGameRoom(opponentId?: number) {
	// 	if (opponentId) this.findRoomForTwo(opponentId);
	// 	else this.findSoloGameRoom();
	// }

	// findSoloGameRoom(): Promise<number> {
	// 	console.log('Trying to find a new game room...');
	// 	return new Promise((resolve, reject) => {
	// 		this.socket.emit('request solo game room', {
	// 			userId: this.userId,
	// 		});

	// 		// Set up a one-time listener for the response
	// 		this.socket.once('assigned game room', (data) => {
	// 			if (data && data.gameRoomId) {
	// 				resolve(data.gameRoomId);
	// 				this.currentGameRoomId = data.gameRoomId;
	// 			} else {
	// 				reject(new Error('Invalid room assignment data received.'));
	// 			}
	// 		});

	// 		// Catching possible errors when trying to get a room
	// 		this.socket.on('error assigning solo room', () => {
	// 			console.log('%cCould not assign a solo room', 'color:purple');
	// 		});

	// 		// Optional: if there is no response from the server after 5 seconds,
	// 		// send reject the promise with an error message
	// 		setTimeout(() => {
	// 			reject(new Error('Room assignment request timed out.'));
	// 		}, 5000);
	// 	});
	// }

	// findRoomForTwo(opponentId: number) {
	// 	// this.setPlayer2Ready(true);
	// }

	// getCurrentGameRoomId(): number {
	// 	return this.currentGameRoomId;
	// }

	// // The room ID is stored in the instance of the gamesocket
	// joinRoom() {
	// 	console.log('GameSocket joinRoom()');
	// 	this.socket.emit('join room', {
	// 		userId: this.userId,
	// 		roomId: this.currentGameRoomId,
	// 	});
	// 	this.socket.on('room error', (errorMessage) => {
	// 		console.error(`Could not join room: ${errorMessage}`);
	// 	});
	// 	this.socket.on('user joined room', (userInfo) => {
	// 		console.log(`%c${userInfo.user.login} joined the room !`, 'color:pink');
	// 	});
	// }

	setPlayer1IsReady(status: boolean) {
		this.setPlayer1Ready(true);
	}
}
