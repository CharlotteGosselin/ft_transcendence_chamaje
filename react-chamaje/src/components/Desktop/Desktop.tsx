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

const Desktop = () => {
	// const [isWindowOpen, setIsWindowOpen] = useState(false);
	const { userData, setUserData } = useContext(UserContext);
	const [openFriendsWindow, setOpenedFriendsWindows] = useState(false);
	const navigate = useNavigate();
	const { isAuthentificated, refreshToken, logOut } = useAuth();

	if (isAuthentificated) {
		console.log('user is authentificated');
	} else console.log('user is not authentificated');
	useEffect(() => {
		// fetch request
		const fetchUserData = async () => {
			// Feth the user data from the server
			try {
				console.log('\n\n DESKTOP: trying to fetch');
				// user/me
				const response = await fetch('http://localhost:3000/user/me', {
					method: 'GET',
					credentials: 'include',
				});
				if (response.ok) {
					const data = await response.json();
					// Set the user data in the context
					setUserData(data);
				} else {
					console.log('Error fetching user data:', response);
					logOut();
					return;
				}
			} catch (error) {
				console.log('Error: ', error);
				return;
			}
		};

		fetchUserData();
	}, [setUserData]);

	const friendsClickHandler = () => {
		setOpenedFriendsWindows(true);
		navigate('/friends');
	};

	return (
		<div className="desktopWrapper">
			<DesktopIcon
				name="Game"
				iconSrc={cupcakeIcon}
				onDoubleClick={friendsClickHandler}
			/>
			<DesktopIcon
				name="Friends"
				iconSrc={cupcakeIcon}
				onDoubleClick={friendsClickHandler}
			/>
			<DesktopIcon
				name="Chat"
				iconSrc={cupcakeIcon}
				onDoubleClick={friendsClickHandler}
			/>
			{/* {openFriendsWindow && <Window windowTitle="Friends"><FriendsList /></Window>}*/}
			<Window
				windowTitle="Friends"
				links={[
					{ name: 'Add friend', url: '#' },
					{ name: 'See online friends', url: '#' },
					{ name: 'Do something', url: '#' },
				]}
			>
				{/* <FriendsList /> */}
				<ProfileSettings />
			</Window>
		</div>
	);
};

export default Desktop;
