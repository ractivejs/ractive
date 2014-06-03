import registry from 'config/registries/registry';
import defineProperty from 'utils/defineProperty';
import template from 'config/templating/template';
import adaptors from 'config/registries/adaptors';
import computed from 'config/computed/computed';
import partials from 'config/registries/partials';

var keys = [
		'computed',
		'adaptors',
		'components',
		'decorators',
		'easing',
		'events',
		'interpolators',
		'template',
		'partials',
		'transitions'
	],
	custom = {
		adaptors:  adaptors,
		template:  template,
		computed:  computed,
		partials:  partials
	},
	registries = keys.map( key => {
		return custom[ key ] || registry( { name: key } );
	});

	defineProperty( registries, 'keys', { value: keys } );

export default registries;


