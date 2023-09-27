import React, { ReactNode, useEffect, useRef, useState } from 'react';
import './Window.css';
import WindowTitleBar from './Components/WindowTitleBar/WindowTitleBar';
import WindowMenu from './Components/WindowMenu/WindowMenu';
import { motion, useDragControls } from 'framer-motion';
import { useWindowContext } from 'src/contexts/WindowContext';

export interface MenuLinks {
	name: string;
	onClick?: () => void;
}

export interface WindowProps {
	windowTitle?: string;
	links?: MenuLinks[];
	useBeigeBackground?: boolean;
	resizable?: boolean;
	children?: ReactNode;
	windowDragConstraintRef?: React.RefObject<HTMLDivElement>;
	initialWindowPosition?: {
		top?: number;
		left?: number;
		bottom?: number;
		right?: number;
	};
	onCloseClick: () => void;
}

const Window: React.FC<WindowProps> = ({
	windowTitle = 'Title',
	resizable = false,
	children,
	links = [],
	useBeigeBackground = false,
	initialWindowPosition,
	windowDragConstraintRef,
	onCloseClick,
}) => {
	const { maxZIndex, updateMaxZIndex } = useWindowContext();
	const [windowZIndex, setWindowZIndex] = useState(maxZIndex);
	const [initialXPosition, setInitialXPosition] = useState<number>(0);
	const [initialYPosition, setInitialYPosition] = useState<number>(0);

	const [dragIsEnabled, setDragIsEnabled] = useState(false);
	const windowRef = useRef<HTMLDivElement | null>(null);
	const [windowIsBeingResized, setWindowIsBeingResized] = useState(false);
	const previousWindowSize = useRef({
		width: 0,
		height: 0,
	});
	const previousMouseCoordinates = useRef({
		x: 0,
		y: 0,
	});

	const dragControls = useDragControls();

	function triggerDragOnElem(event: React.PointerEvent<HTMLDivElement>) {
		// Change the z-index of the window even when just dragging it
		updateMaxZIndex();
		setWindowZIndex(windowZIndex + 1);
		// And start dragging !
		dragControls.start(event, {});
	}

	// Handle window resizing for the game
	useEffect(() => {
		if (resizable) {
			const handleResize = (event: MouseEvent) => {
				if (!windowIsBeingResized || !windowRef.current) return;

				const xMoveDistance =
					event.clientX - previousMouseCoordinates.current.x;
				const yMoveDistance =
					event.clientY - previousMouseCoordinates.current.y;

				const originalWidth = previousWindowSize.current.width;
				const originalHeight = previousWindowSize.current.height;

				// Calculate aspect ratio
				const aspectRatio = originalWidth / originalHeight;

				// Calculate new dimensions
				const newWidth = originalWidth + xMoveDistance;
				const newHeight = newWidth / aspectRatio; // Keep aspect ratio

				// Validation for height and width
				if (
					newHeight <= window.innerHeight * 0.85 &&
					newHeight >= window.innerHeight * 0.5
				) {
					windowRef.current.style.height = `${newHeight}px`;
					windowRef.current.style.width = `${newWidth}px`;
				}
			};

			const handleMouseUp = () => {
				if (windowIsBeingResized) {
					setWindowIsBeingResized(false);
				}
			};

			window.addEventListener('mousemove', handleResize);
			window.addEventListener('mouseup', handleMouseUp);

			return () => {
				window.removeEventListener('mousemove', handleResize);
				window.removeEventListener('mouseup', handleMouseUp);
			};
		}
	}, [resizable, windowIsBeingResized]);

	// When the component mounts, bring it to the front by updating its z-index
	// and give it saved coordinates if they exist
	useEffect(() => {
		updateMaxZIndex();
		if (windowRef.current) {
			windowRef.current.style.zIndex = String(maxZIndex + 1);
		}
	}, []);

	// Handler when window needs to be brought to the front of the screen
	const bringToFront = () => {
		updateMaxZIndex();
		if (windowRef.current) {
			windowRef.current.style.zIndex = String(maxZIndex + 1);
		}
	};

	return (
		<motion.div
			id={`${windowTitle.toLowerCase()}-window`}
			initial={{
				left: initialWindowPosition?.left || 'initial',
				top: initialWindowPosition?.top || 'initial',
				bottom: initialWindowPosition?.bottom || 'initial',
				right: initialWindowPosition?.right || 'initial',
				opacity: 0,
				scale: 0,
			}}
			animate={{
				scale: 1,
				opacity: 1,
			}}
			exit={{ opacity: 0, scale: 0 }}
			transition={{ duration: 0.2 }}
			className="window-wrapper"
			drag={dragIsEnabled}
			whileDrag={{ scale: 0.9, opacity: 0.85 }}
			dragControls={dragControls}
			dragListener={false}
			dragConstraints={windowDragConstraintRef}
			ref={windowRef}
			onClick={bringToFront}
			onAnimationComplete={() => {
				// Once the div has fully transitionned in,
				// store its initial dimensions in the corresponding state
				if (resizable && windowRef.current) {
					const { width, height } = windowRef.current.getBoundingClientRect();
					previousWindowSize.current.width = width;
					previousWindowSize.current.height = height;
				}
				setDragIsEnabled(true);
			}}
		>
			{/* TODO: I had to put the title bar in a div to give it the onPointerDown property, ideally this would be inclded in the component itself*/}
			<WindowTitleBar
				windowTitle={windowTitle}
				onCloseClick={onCloseClick}
				onMouseDown={triggerDragOnElem}
			/>
			{links && links.length > 0 && (
				<WindowMenu>
					{links.map((linkElem, index) => (
						<span onClick={linkElem.onClick} key={index}>
							{linkElem.name}
						</span>
					))}
				</WindowMenu>
			)}
			<div
				className="window-content"
				style={{ backgroundColor: useBeigeBackground ? '#FFFBEC' : '' }}
			>
				{children}
			</div>
			{resizable && (
				<div
					className="window-resize-handle"
					onMouseDown={(event) => {
						setWindowIsBeingResized(true);
						previousMouseCoordinates.current.x = event.clientX;
						previousMouseCoordinates.current.y = event.clientY;
						const currentWindowSize =
							windowRef.current?.getBoundingClientRect();
						if (currentWindowSize) {
							previousWindowSize.current.height = currentWindowSize?.height;
							previousWindowSize.current.width = currentWindowSize?.width;
						}
					}}
				></div>
			)}
		</motion.div>
	);
};

export default Window;
