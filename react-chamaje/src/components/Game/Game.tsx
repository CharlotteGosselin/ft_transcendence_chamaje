import React, { useEffect, useRef, useState } from 'react';
import './Game.css';
import Window from '../Window/Window';
import { Paddle } from './Entities/Paddle';
import { Ball } from './Entities/Ball';

interface IGameProps {
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	onCloseClick: () => void;
}

const Game: React.FC<IGameProps> = ({
	onCloseClick,
	windowDragConstraintRef,
}) => {
	const [userHasOpponent, setUserHasOpponent] = useState(true);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		// Check that the canvas loaded
		if (!canvasRef.current) return;
		const canvasDrawingCtx = canvasRef.current.getContext('2d');
		if (!canvasDrawingCtx) return;

		// Few variables
		const initialPaddleHeight = 0.2 * canvasRef.current.height;
		const initialPaddleWidth = 5;
		const initialBallWidth = 10;

		// Create my two paddles
		const paddlePlayer1 = new Paddle(
			0,
			canvasRef.current.height / 2 - initialPaddleHeight / 2,
			initialPaddleWidth,
			initialPaddleHeight,
		);
		const paddlePlayer2 = new Paddle(
			canvasRef.current.width - initialPaddleWidth,
			canvasRef.current.height / 2 - initialPaddleHeight / 2,
			initialPaddleWidth,
			initialPaddleHeight,
		);
		// Create my ball
		const ball = new Ball(
			canvasRef.current.width / 2,
			canvasRef.current.height / 2,
			initialBallWidth,
		);

		// Make the window listen for keys
		// TODO: should only do something if the gameWindow is in focus
		window.addEventListener('keydown', function (e) {
			// keys[e.key] = true;
			if (e.key === 'ArrowUp') paddlePlayer1.direction = -1;
			if (e.key === 'ArrowDown') paddlePlayer1.direction = 1;
			// Prevent the key's default behavior, so it does not scroll down for example
			e.preventDefault();
		});
		window.addEventListener('keyup', function (e) {
			// delete keys[e.key];
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown')
				paddlePlayer1.direction = 0;
		});

		// This is the loop that continualy updates our game
		const loop = () => {
			// Modify the state of the game based on user input
			update();
			// Draw the current state of objects onto the screen
			draw();
			// Request the next frame
			window.requestAnimationFrame(loop);
		};

		const draw = () => {
			clearCanvas();
			drawNet();
			ball.draw(canvasDrawingCtx);
			drawPaddles();
		};

		// Update the position of each element
		const update = () => {
			if (canvasRef.current) {
				// Update paddles position
				paddlePlayer1.move(canvasRef.current);
				// paddlePlayer2.move();
				// Update ball position
				ball.move();
				// Check that the ball does not collide with a paddle
				if (
					ball.paddleBounceCheck(paddlePlayer1, 'left') ||
					ball.paddleBounceCheck(paddlePlayer2, 'right')
				)
					return;
				// Check that the ball has not collided with a wall
				ball.wallCollisionCheck(canvasRef.current);
				// ball.paddleBounceCheck(paddlePlayer2);
			}
		};
		// Remove everything that was on the canvas
		const clearCanvas = () => {
			if (canvasDrawingCtx && canvasRef.current)
				canvasDrawingCtx.clearRect(
					0,
					0,
					canvasRef.current.width,
					canvasRef.current.height,
				);
		};
		const drawPaddles = () => {
			paddlePlayer1.draw(canvasDrawingCtx);
			paddlePlayer2.draw(canvasDrawingCtx);
		};
		const drawNet = () => {
			if (canvasDrawingCtx && canvasRef.current) {
				canvasDrawingCtx.fillStyle = gradient;
				canvasDrawingCtx.fillRect(
					canvasRef.current?.width / 2 - netWidth / 2,
					0,
					netWidth,
					canvasRef.current.height,
				);
				canvasDrawingCtx.fillStyle = 'white';
			}
		};

		let gradient: CanvasGradient;
		const netWidth = 3;
		const setupCanvasStyle = () => {
			if (!canvasDrawingCtx || !canvasRef.current) return;
			canvasDrawingCtx.fillStyle = 'white';
			canvasDrawingCtx.shadowColor = 'pink';
			canvasDrawingCtx.shadowBlur = 20;
			canvasDrawingCtx.shadowOffsetX = 0;
			canvasDrawingCtx.shadowOffsetY = 0;

			// Setup the gradient
			gradient = canvasDrawingCtx.createLinearGradient(
				canvasRef.current.width / 2 - netWidth / 2,
				0,
				canvasRef.current.width / 2 + netWidth / 2,
				canvasRef.current.height,
			);
			// Add colors to it
			gradient.addColorStop(0.1086, 'rgba(194, 255, 182, 0.69)');
			gradient.addColorStop(0.5092, 'rgba(254, 164, 182, 1.00)');
			gradient.addColorStop(0.5093, '#FFA3B6');
			gradient.addColorStop(0.7544, '#DDA9FF');
			gradient.addColorStop(1.0, '#A2D1FF'); // Adjusted to the maximum allowable value of 1.0
		};
		setupCanvasStyle();
		loop();
	}, []);
	return (
		<Window
			windowTitle="Game"
			onCloseClick={onCloseClick}
			windowDragConstraintRef={windowDragConstraintRef}
			resizable={true}
		>
			{/* TODO: add the player information above the canvas game */}
			<div className={`game-wrapper`}>
				{userHasOpponent ? (
					<>
						<canvas
							className="game-canvas"
							ref={canvasRef}
							width={700}
							height={500}
						>
							This browser doesnt support canvas technology, try another or
							update.
						</canvas>
					</>
				) : (
					<>
						<span className="game-waiting">Waiting for a match...</span>
					</>
				)}
			</div>
		</Window>
	);
};

export default Game;
