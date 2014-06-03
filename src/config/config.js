import initOptions from 'config/initOptions';
import basicConfig from 'config/basicConfig';
import fnConfig from 'config/functionConfig';
import parseConfig from 'config/parseConfig';
import registryConfig from 'config/registries/registry';
import defineProperty from 'utils/defineProperty';
import templateConfig from 'config/templating/template';
import cssConfig from 'config/css/css';
import adaptors from 'config/registries/adaptors';
import computed from 'config/computed/computed';
import partials from 'config/registries/partials';

var custom, options, keys, registries, config, exclude, parseKeys, parseOptions;

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

parseKeys = [
 	'preserveWhitespace',
	'sanitize',
	'stripComments',
	'delimiters',
	'tripleDelimiters',
	'handlebars'
];

parseOptions = parseKeys.map( key => {
	return parseConfig( key );
});

parseKeys.forEach( key => {
	parseOptions[ key ] = true;
});


// basicConfig for all options except registries, parse, and custom configuration
options = initOptions.keys
	.filter( key => {
		return !registries[ key ]
			&& !custom[ key ]
			&& !parseOptions[ key ];
	})
	.map( basicConfig );


config = [ /*dataConfig*/ ]
	.concat( options )
	.concat( parseOptions )
	.concat( custom.complete )
	.concat( registries )
	.concat( custom.template, custom.css );

config.registries = keys;

export default config;




