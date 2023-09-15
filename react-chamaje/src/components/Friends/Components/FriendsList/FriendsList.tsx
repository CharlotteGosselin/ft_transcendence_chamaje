import React, { useContext, useEffect, useRef, useState } from 'react';
import './FriendsList.css';
import FriendBadge from '../FriendBadge/FriendBadge';
import useAuth from '../../../../hooks/userAuth';
import { UserContext } from '../../../../contexts/UserContext';
import { io } from 'socket.io-client';
import Window from 'src/components/Window/Window';
import { IFriendStruct } from 'src/components/Desktop/Desktop';
import Profile from 'src/components/Profile/Profile';
import SettingsWindow from 'src/components/Profile/Components/Shared/SettingsWindow/SettingsWindow';
import Title from 'src/components/Profile/Components/Title/Title';
import InputField from 'src/components/Profile/Components/InputField/InputField';
import Button from 'src/components/Shared/Button/Button';

interface IFriendsListProps {
	onCloseClick: () => void;
	onBadgeClick: (friendLogin: string) => void;
	windowDragConstraintRef: React.RefObject<HTMLDivElement>;
	friends: IFriendStruct[];
	nbFriendsOnline: number;
	setFriends: React.Dispatch<React.SetStateAction<IFriendStruct[]>>;
}

const FriendsList: React.FC<IFriendsListProps> = ({
	friends,
	nbFriendsOnline,
	onCloseClick,
	windowDragConstraintRef,
	onBadgeClick,
	setFriends,
}) => {
	const { userData, setUserData } = useContext(UserContext);
	const { accessToken } = useAuth();
	const [settingsPanelIsOpen, setSettingsPanelIsOpen] = useState(false);
	const [searchedLogin, setSearchedLogin] = useState('');
	const [searchUserError, setSearchUserError] = useState('');
	const [searchUserSuccess, setSearchUserSuccess] = useState('');
	const [isFriendAdded, setIsFriendAdded] = useState(false);

	const handleLoginChange = (login: string) => {
		setSearchedLogin(login);
		setSearchUserError('');
		setSearchUserSuccess('');
	};

	const fetchFriend = async () => {
		fetch('/api/user/friends', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				console.log('🩵 friends list before: ', friends);
				setFriends(data);

				setIsFriendAdded(false);
			})
			.then(() => {
				console.log('LIST - FRIENDS: ', friends);
			});
	};

	const addFriend = async () => {
		try {
			const response = await fetch(`api/user/${searchedLogin}/add`, {
				method: 'PUT',
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.ok) {
				setSettingsPanelIsOpen(false);
				setIsFriendAdded(true);
			} else {
				const Error = await response.json();
				setSearchUserError(Error.message);
			}
		} catch (error) {
			throw new Error('internal error');
		}
	};

	useEffect(() => {
		if (isFriendAdded) {
			console.log('🩵 just added a friend, fetching friend');
			fetchFriend();
		}
		return () => {
			// userData?.chatSocket?.endConnection();
		};
	}, [isFriendAdded]);

	useEffect(() => {
		console.log('Mounting: ', friends);
	});

	return (
		<Window
			windowTitle="Friends"
			onCloseClick={onCloseClick}
			key="friends-list-window"
			windowDragConstraintRef={windowDragConstraintRef}
			links={[
				{
					name: 'Add friend',
					onClick: () => {
						setSettingsPanelIsOpen(true);
					},
				},
			]}
		>
			<div className="friendsList">
				{friends.map((friend, index) => (
					// TODO: I don't like how the badgeImageUrl is constructed by hand here, it's located in our nest server, maybe there's a better way to do this ?
					<FriendBadge
						key={index}
						badgeTitle={friend.login}
						badgeImageUrl={`http://localhost:3000${friend.image}`}
						onlineIndicator={friend.onlineStatus}
						isClickable={true}
						onClick={() => {
							onBadgeClick(friend.login);
						}}
					/>
				))}
			</div>
			{settingsPanelIsOpen && (
				<SettingsWindow settingsWindowVisible={setSettingsPanelIsOpen}>
					<Title highlightColor="yellow">Username</Title>
					<div className="settings-form">
						<InputField
							onChange={handleLoginChange}
							error={searchUserError}
							success={searchUserSuccess}
							maxlength={8}
						></InputField>

						<Button
							onClick={() => {
								addFriend();
							}}
						>
							Add friend
						</Button>
					</div>
				</SettingsWindow>
			)}
			<div className="bottomInfo">
				{' '}
				{friends.length} friends, {nbFriendsOnline} online{' '}
			</div>
		</Window>
	);
};

export default FriendsList;
