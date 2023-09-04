import React, { useEffect, useState } from 'react';
import './MatchHistoryBadge.css';
import FriendBadge from '../../../../../Friends/Components/FriendBadge/FriendBadge';
import BlackBadge from '../../../Shared/BlackBadge/BlackBadge';

interface IMatchHistoryBadgeProps {
	adversaryLogin: string;
	badgeImageUrl?: string;
	userScore: number;
	adversaryScore: number;
}

const MatchHistoryBadge: React.FC<IMatchHistoryBadgeProps> = ({
	adversaryLogin,
	badgeImageUrl,
	userScore,
	adversaryScore,
}) => {
	// TODO: implement this state/variable dynamically
	const [playerWon, setPlayerWon] = useState(false);

	useEffect(() => {
		setPlayerWon(userScore > adversaryScore);
	}, []);

	return (
		<div
			className={`match-history-badge ${playerWon ? 'black-and-white' : ''}`}
		>
			<div
				className={`winning-status ${playerWon ? 'player-won' : 'player-lost'}`}
			>
				YOU {`${playerWon ? 'WON' : 'LOST'}`}
			</div>
			<FriendBadge badgeTitle={adversaryLogin} badgeImageUrl={badgeImageUrl} />
			<BlackBadge>
				Score: {userScore}/{adversaryScore}
			</BlackBadge>
		</div>
	);
};

export default MatchHistoryBadge;
