import optionGroup from 'config/options/groups/optionGroup';
import registry from 'config/options/registry';

var keys = [
		'adaptors',
		'components',
		'decorators',
		'easing',
		'events',
		'interpolators',
		'partials',
		'transitions'
	],
	registries = optionGroup( keys, key => registry( { name: key } ) );

export default registries;
