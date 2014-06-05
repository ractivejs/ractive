import optionGroup from 'config/options/groups/optionGroup';
import registry from 'config/options/registry';
import adaptors from 'config/options/adaptors';
import events from 'config/options/events';

var keys, custom, registries;

keys = [
	'adaptors',
	'components',
	'decorators',
	'easing',
	'events',
	'interpolators',
	'partials',
	'transitions'
];

custom = {
	adaptors:  adaptors,
	events:    events
};

registries = optionGroup( keys, key => {
	return custom[ key ] || registry( { name: key } );
});

export default registries;
