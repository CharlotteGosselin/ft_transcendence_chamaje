import { Socket, io } from 'socket.io-client';
import { AuthContext } from 'src/contexts/AuthContext';
import useAuth from 'src/hooks/userAuth';

interface callbackInterface {
	(data: any): void;
}
class WebSocketService {
	public socket: Socket;
	private userId: number;

	constructor(accessToken: string, userId: number) {
		this.userId = userId;
		this.socket = io({
			path: '/ws/',
			reconnection: false,
			auth: { accessToken },
		});
		try {
			// Listen for the 'connect' event
			this.socket.on('connect', () => {
				this.sendServerConnection();
			});
			// Listen for the 'disconnect' event prevent reconnection from wanted disconnection
			this.socket.on('disconnect', (reason) => {
				if (
					reason != 'io client disconnect' &&
					reason != 'io server disconnect'
				) {
					// the disconnection was initiated by the server, you need to reconnect manually
					this.socket.connect();
				} else {
					// this.endConnection(this.userId);
					this.socket.disconnect();
				}
			});
		} catch (e) {
			console.error(e, ': WebSocketService Constructor');
		}
	}

	getSocket(): Socket {
		return this.socket;
	}

	/* ********************************************************************* */
	/* ************************** CONNECTED STATUS ************************* */
	/* ********************************************************************* */
	sendServerConnection() {
		try {
			this.socket.emit('ServerConnection', this.userId);
		} catch (e) {
			console.error(e, ': WebSocketService sendServerConnection');
		}
	}

	onClientLogIn(callback: callbackInterface) {
		this.socket.on('ClientLogIn', (data: number) => {
			callback(data);
			this.socket.emit('ServerLogInResponse', this.userId);
		});
	}

	onClientLogInResponse(callback: callbackInterface) {
		this.socket.on('ClientLogInResponse', callback);
	}

	endConnection() {
		this.socket.emit('ServerEndedConnection', this.userId);
	}

	onLogOut(callback: callbackInterface) {
		this.socket.on('ClientLogOut', callback);
	}

	/* ********************************************************************* */
	/* ******************************** CHAT ******************************* */
	/* ********************************************************************* */
	joinRoom(chatId: number) {
		this.socket.emit('joinRoom', chatId);
		console.log('🚪 Entering room n.', chatId);
	}

	leaveRoom(chatId: number) {
		this.socket.emit('leaveRoom', chatId);
		console.log('🚪 Leaving room n.', chatId);
	}

	sendMessage(message: string, chatId: number, login: string, avatar: string) {
		this.socket.emit('sendMessage', {
			chatId: chatId,
			message: message,
			userId: this.userId,
			login: login,
			avatar: avatar,
		});
		console.log('sending message to ' + chatId + ': ' + message);
	}

	// used when on active chat
	onReceiveMessage(callback: callbackInterface) {
		this.socket.on('receiveMessage', callback);
		console.log('message listener on');
	}

	// used when leaving active chat but staying in room
	offReceiveMessage(callback: callbackInterface) {
		this.socket.off('receiveMessage', callback);
		console.log('message listener on');
	}
}
export default WebSocketService;
