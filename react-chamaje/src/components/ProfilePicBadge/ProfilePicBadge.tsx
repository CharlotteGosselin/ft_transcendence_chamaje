import React from 'react';
import './ProfilePicBadge.css';
import ShadowWrapper from '../Shared/ShadowWrapper/ShadowWrapper';
import pen  from './images/edit-pen-svgrepo-com.svg';

export interface ProfilePicBadgeProps {
	picture: string;
	isModifiable?: boolean;
}

const ProfilePicBadge: React.FC<ProfilePicBadgeProps> = ({
	picture,
	isModifiable = false,
}) => {
	return (
		<div className="ProfilePicBadgeWrapper">
			<ShadowWrapper shadow={true}>
				<div
					className="pictureContainer"
					style={{
						backgroundImage: `url('${picture}')`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				></div>
				{isModifiable && (
					<div className="modifyButton">
						<ShadowWrapper shadow={true} clickable={true}>
							<img src={pen}></img>
						</ShadowWrapper>
					</div>
				)}
			</ShadowWrapper>
		</div>
	);
};

export default ProfilePicBadge;
