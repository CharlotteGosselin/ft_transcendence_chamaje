/* eslint-disable */
import TargetBadge from './TargetBadge';

export default {
	title: 'TargetBadge',
};

export const Default = () => (
	<TargetBadge isOwnProfile={false} targetLogin="login" />
);

Default.story = {
	name: 'default',
};
