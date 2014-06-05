import optionGroup from 'config/options/groups/optionGroup';
import registry from 'config/options/registry';
import adaptors from 'config/options/adaptors';
import computed from 'config/options/computed';
import events from 'config/options/events';
import partials from 'config/options/partials';

var keys, custom, registries;

keys = [
	'adaptors',
	'components',
	'computed',
	'decorators',
	'easing',
	'events',
	'interpolators',
	'partials',
	'transitions'
];

custom = {
	adaptors:  adaptors,
	computed:  computed,
	events:    events,
	partials:  partials
};

registries = optionGroup( keys, key => {
	return custom[ key ] || registry( { name: key } );
});

export default registries;
