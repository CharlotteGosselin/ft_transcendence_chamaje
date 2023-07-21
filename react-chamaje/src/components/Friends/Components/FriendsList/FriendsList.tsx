import React from 'react';
import './FriendsList.css';
import FriendBadge from '../FriendBadge/FriendBadge';
import MatchHistoryBadge from '../../../Profile/Components/MatchHistoryBadge/MatchHistoryBadge';
import RivalBadge from '../../../Profile/Components/RivalBadge/RivalBadge';
import OnlineStatusFriendBadge from '../../../Profile/Components/OnlineStatusFriendBadge/OnlineStatusFriendBadge';

const FriendsList = () => {
	return (
		<div>
			<div className="friendsList">
				<FriendBadge badgeTitle="m3gan" shadow={true} clickable={true} />
				<FriendBadge badgeTitle="m3gan" />
				<FriendBadge badgeTitle="m3gan" />
				<OnlineStatusFriendBadge badgeTitle="m3gan" />
				<RivalBadge />
				<MatchHistoryBadge
					badgeTitle="m3gan"
					userScore={5}
					adversaryScore={7}
				/>
			</div>
			<div className="bottomInfo">3 friends, 1 online</div>
		</div>
	);
};

export default FriendsList;
