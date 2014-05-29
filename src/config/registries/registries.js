import registry from 'config/registries/registry';
import defineProperty from 'utils/defineProperty';
import template from 'config/template/template';
import computed from 'config/registries/computed';
import easing from 'config/registries/easing';
import interpolators from 'config/registries/interpolators';

var keys = [
		'computed',
		'adaptors',
		'components',
		'decorators',
		'easing',
		'events',
		'interpolators',
		'template',
		//'partials',
		'transitions'
	],
	custom = {
		template: 		template,
		computed: 		computed,
		easing:			easing,
		interpolators:	interpolators
	},
	registries = keys.map( key => {
		return custom[ key ] || registry( { name: key } );
	});

	defineProperty( registries, 'keys', { value: keys } );

export default registries;


