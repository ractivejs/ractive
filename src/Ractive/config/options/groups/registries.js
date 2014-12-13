import optionGroup from './optionGroup';
import Registry from '../Registry';

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
