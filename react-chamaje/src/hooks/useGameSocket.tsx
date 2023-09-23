import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { GameContext } from '../contexts/GameContext';
import { IGameState } from '../../../shared-lib/types/game';
import { Socket, io } from 'socket.io-client';
import useAuth from './userAuth';
import type { IPlayerInformation } from '../../../shared-lib/types/game';
import { IPlayerMovementPayload } from 'shared-lib/types/game';

export const useGameSocket = () => {
	// Import necessary contexts
	const { userData } = useContext(UserContext);
	const { gameData, updateGameData, resetGameData } = useContext(GameContext);
	const { accessToken } = useAuth();

	// Set a socket Ref so I can use it anywhere in this hook
	const socketRef = useRef<Socket | null>(null);

	// on hook init
	useEffect(() => {
		if (!socketRef.current) {
			// Initialize the socket connection
			socketRef.current = io({
				path: '/ws/',
				reconnection: false,
				auth: { accessToken: accessToken },
			});
			// Store it in our context
			updateGameData({ socket: socketRef.current });
		}

		return () => {
			socketLog('Disconnecting socket 🔴');
			// // TODO: when the socket is disconnected, all the listener should be removed with the off method I think
			socketRef.current?.disconnect();
		};
	}, []);

	const socketLog = (logContent: string) => {
		console.log(
			`%c Socket %c ${logContent}`,
			'background: purple; color: pink',
			'',
		);
	};

	// Once a socket is assigned, setup our basic listeners
	useEffect(() => {
		if (!gameData.socket) return;

		gameData.socket.on('connect', () => {
			socketLog('Connected to server ! 🟢 ');
		});
		gameData.socket.on('identification_ok', () => {
			socketLog('Server authentification confirmed');
			updateGameData({ connectedToServer: true });
		});
		gameData.socket.on('connect_error', (error: Error) => {
			updateGameData({ connectionErrorStatus: 'Connection error' });
			// setConnectionStatus('Connection error');
		});
		gameData.socket.on('connect_timeout', () => {
			updateGameData({ connectionErrorStatus: 'Connection timeout' });
			// setConnectionStatus('Connection timeout');
		});
		gameData.socket.on('connection_limit_reached', () => {
			updateGameData({
				connectionErrorStatus:
					'Too many connections, please close some tabs and refresh !',
			});
		});
		gameData.socket.on('error', (error) => {
			console.error('General Error:', error);
		});
		// Listen for the 'disconnect' event prevent reconnection from wanted disconnection
		gameData.socket.on('disconnect', (reason) => {
			if (
				reason != 'io client disconnect' &&
				reason != 'io server disconnect'
			) {
				// the disconnection was initiated by the server, you need to reconnect manually
				if (gameData.socket) gameData.socket.connect();
			} else {
				if (gameData.socket) gameData.socket.disconnect();
			}
		});

		gameData.socket.on('opponent-info', (information: IPlayerInformation) => {
			socketLog(
				`Received opponent's information: ${JSON.stringify(
					information,
					null,
					4,
				)}`,
			);
			updateGameData({ opponentInfo: information });
		});

		gameData.socket.on('opponent-is-ready', () => {
			updateGameData({ player2Ready: true });
		});

		// gameData.socket.on('game-has-started', () => {
		// 	socketLog('The game has staaaaaarted');
		// 	updateGameData({ gameIsPlaying: true });
		// });

		gameData.socket.on('game-state-update', (serverGameState: IGameState) => {
			// socketLog('received game state update');
			// Mark the game as started
			if (!gameData.gameIsPlaying) updateGameData({ gameIsPlaying: true });
			updateGameData({ gameState: serverGameState });
		});
	}, [gameData.socket]);

	const notifyPlayerIsReady = () => {
		socketRef.current?.emit('player-is-ready', {
			userId: userData.id,
			roomId: gameData.roomId,
		});
	};

	const broadcastPlayerPosition = (payload: IPlayerMovementPayload) => {
		socketRef.current?.emit('player-moved', payload);
	};

	const notifyPlayerLeft = () => {
		socketRef.current?.emit('player-left', {
			playerId: userData?.id,
		});
	};

	const startGame = () => {
		socketRef.current?.emit('game started');
	};

	return {
		socketRef,
		broadcastPlayerPosition,
		setPlayer1AsReady: notifyPlayerIsReady,
		startGame,
	};
};
