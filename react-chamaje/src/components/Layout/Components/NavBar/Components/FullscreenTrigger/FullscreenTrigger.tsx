import React, { useState } from 'react';
import './FullscreenTrigger.css';

const FullscreenTrigger = () => {
	const [isFullScreen, setIsFullScreen] = useState(false);
	const triggerFullScreen = () => {
		if (!isFullScreen && document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen();
			setIsFullScreen(true);
		} else if (isFullScreen && document.exitFullscreen) {
			document.exitFullscreen();
			setIsFullScreen(false);
		}
	};

	return (
		<div
			className={`fullscreen-trigger ${isFullScreen ? 'is-fullscreen' : ''}`}
			title={`${isFullScreen ? 'Exit fullscreen' : 'Fullscreen'}`}
			onClick={triggerFullScreen}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 38.14 24.94"
				className="fullscreen-icon"
			>
				<polyline
					className="cls-1"
					points="37.14 16.6 37.14 23.94 26.38 23.94"
				/>
				<polyline className="cls-1" points="1 16.6 1 23.94 11.77 23.94" />
				<polyline className="cls-1" points="1 8.34 1 1 11.77 1" />
				<polyline className="cls-1" points="37.14 8.34 37.14 1 26.38 1" />
			</svg>
		</div>
	);
};

export default FullscreenTrigger;
