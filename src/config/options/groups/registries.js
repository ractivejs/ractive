import optionGroup from 'config/options/groups/optionGroup';
import Registry from 'config/options/Registry';

var keys = [
		'adaptors',
		'components',
		'computed',
		'decorators',
		'easing',
		'events',
		'interpolators',
		'partials',
		'transitions'
	],
	registries = optionGroup( keys, key => new Registry( key, key === 'computed' ) );

export default registries;
