import React, { useContext, useEffect, useState } from 'react';
import './Desktop.css';
import DesktopIcon from './Components/DesktopIcon/DesktopIcon';
import cupcakeIcon from './Components/DesktopIcon/images/CUPCAKE.svg';
import Window from '../Window/Window';
import { useNavigate } from 'react-router-dom';
import FriendsList from '../Friends/Components/FriendsList/FriendsList';
import { UserContext } from '../../contexts/UserContext';
import useAuth from '../../hooks/userAuth';
import ProfileSettings from '../Profile/Components/ProfileSettings/ProfileSettings';
import { AuthContext } from '../../contexts/AuthContext';
import Profile from '../Profile/Profile';
import { io } from 'socket.io-client';
import WebSocketService from 'src/services/WebSocketService';
import Button from './../Shared/Button/Button';
import { unmountComponentAtNode, render } from 'react-dom';
import { createRoot } from 'react-dom/client';

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	let iconId = 0;
	const { userData, setUserData } = useContext(UserContext);
	const [openFriendsWindow, setOpenedFriendsWindows] = useState(false);
	const navigate = useNavigate();
	const {
		isAuthentificated,
		refreshToken,
		logOut,
		accessToken,
		setIsTwoFAEnabled,
		isTwoFAEnabled,
		TwoFAVerified,
		setTwoFAVerified,
	} = useAuth();

	let [qrcode, setQrcode] = useState('');

	useEffect(() => {
		// if (!isAuthentificated) return;
		const fetchUserData = async () => {
			// Feth the user data from the server
			try {
				const response = await fetch('/api/user/me', {
					method: 'GET',
					credentials: 'include',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (response.ok) {
					const data = await response.json();
					console.log(data);
					const mySocket = new WebSocketService(accessToken, data.id);
					const updatedData = {
						...data,
						chatSocket: mySocket,
					};
					// Set the user data in the context
					setUserData(updatedData);
					// setIsTwoFAEnabled(true);
				} else {
					logOut();
				}
			} catch (error) {
				console.log('Error: ', error);
			}
		};

		if (isAuthentificated) fetchUserData();
		return () => {
			userData?.chatSocket?.endConnection();
			// when unmounting desktop component, reset userData
			setUserData(null);
		};
	}, []);

	useEffect(() => {
		window.addEventListener('unload', handleTabClosing);
		return () => {
			window.removeEventListener('unload', handleTabClosing);
		};
	});

	const handleTabClosing = () => {
		userData?.chatSocket?.endConnection();
		logOut();
		setUserData(null);
	};

	const friendsClickHandler = () => {
		setOpenedFriendsWindows(true);
		navigate('/friends');
	};

	// TEST BUTTON FOR ENABLING TWO FACTOR AUTHENTICATION
	const handleClick = async () => {
		try {
			const response = await fetch('api/login/2fa/turn-on', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				console.log(response);
				const data = await response.text();
				console.log('qr code: ', data);
				setQrcode(data);
				setIsTwoFAEnabled(true);
				setTwoFAVerified(false);
				// logOut();
			}
		} catch (error) {
			console.error('2fa: ', error);
		}
	};
	useEffect(() => {}, [qrcode]);

	useEffect(() => {
		console.log('\n\n Desktop: is two fa enabled ?', isTwoFAEnabled);
	}, [isTwoFAEnabled]);

	const handleClickDisable = async () => {
		try {
			const response = await fetch('api/login/2fa/turn-off', {
				method: 'POST',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				console.log('is oke');
				setQrcode('');
				setIsTwoFAEnabled(false);
				setTwoFAVerified(false);
			}
		} catch (error) {
			console.error('2fa: ', error);
		}
	};

	return (
		<div id="desktop">
			<div className="desktopWrapper">
				<DesktopIcon
					name="Game"
					iconSrc={cupcakeIcon}
					id={++iconId}
					onDoubleClick={friendsClickHandler}
				/>
				<DesktopIcon
					name="Friends"
					iconSrc={cupcakeIcon}
					id={++iconId}
					onDoubleClick={friendsClickHandler}
				/>
				<DesktopIcon
					name="Chat"
					iconSrc={cupcakeIcon}
					id={++iconId}
					onDoubleClick={friendsClickHandler}
				/>
				<Window
					windowTitle={userData?.login || 'window title'}
					links={[
						{ name: 'Link1', url: '#' },
						{ name: 'Link2', url: '#' },
						{ name: 'Link3', url: '#' },
					]}
					useBeigeBackground={true}
				>
					<Button baseColor={[308, 80, 92]} onClick={handleClick}>
						enable 2fa
					</Button>
					{qrcode && <img src={qrcode} />}
					<Button baseColor={[308, 80, 92]} onClick={handleClickDisable}>
						disable 2fa
					</Button>
					<Profile login={userData ? userData.login : 'random'} />
					{/* <Profile login='randomLg'/> */}

					{/* <FriendsList/> */}
				</Window>
			</div>
		</div>
	);
};

export default Desktop;
