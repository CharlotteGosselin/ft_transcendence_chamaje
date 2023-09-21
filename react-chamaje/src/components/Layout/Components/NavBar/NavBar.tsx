import React, { useContext } from 'react';
import './NavBar.css';
import Lock from './Components/Lock/Lock';
import Clock from './Components/Clock/Clock';
import { UserContext } from '../../../../contexts/UserContext';
import FullscreenTrigger from './Components/FullscreenTrigger/FullscreenTrigger';
import AnnaWintour from './../../../../images/Anna_Wintour.jpg';
export interface navBarProps {
	isLoggedIn?: boolean;
}

const NavBar: React.FC<navBarProps> = ({ isLoggedIn = true }) => {
	const navClasses = 'navBar' + `${isLoggedIn ? ' loggedIn' : ''}`;
	const { userData } = useContext(UserContext);

	return (
		<div className={navClasses}>
			<div className="menuItems">
				{/* <Button></Button> */}
				<a href="#" title="Link name">
					Game
				</a>
				<a>Friends</a>
				<a>Settings</a>
			</div>
			<div className="siteTitle">chamaje</div>
			<div className="toolBox">
				<span>{userData ? userData.login : ''}</span>
				<FullscreenTrigger />
				<img
					className="userAvatar"
					src={userData ? userData.image : AnnaWintour}
				/>
				<Lock />
				<Clock />
			</div>
		</div>
	);
};

export default NavBar;
