import initOptions from 'config/initOptions';
import basicConfig from 'config/basicConfig';
import fnConfig from 'config/functionConfig';
import registryConfig from 'config/registries/registry';
import defineProperty from 'utils/defineProperty';
import templateConfig from 'config/templating/template';
import cssConfig from 'config/css/css';
import adaptors from 'config/registries/adaptors';
import computed from 'config/computed/computed';
import partials from 'config/registries/partials';

var custom, options, keys, registries, config, exclude;

keys = [
	'computed',
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
	computed:  computed,
	partials:  partials
};

registries = keys.map( key => {
	return custom[ key ] || registryConfig( { name: key } );
});

registries.keys = keys;

custom = {
	complete: fnConfig( 'complete' ),
	template: templateConfig,
	css: cssConfig
};


// basicConfig for all options except registries and custom configuration
options = initOptions.keys
	.filter( key => {
		return !registries[ key ] && !custom[ key ];
	})
	.map( basicConfig );


config = [ /*dataConfig*/ ]
	.concat( options )
	.concat( custom.complete )
	.concat( registries )
	.concat( custom.template, custom.css );

config.registries = keys;

export default config;




