import adapt from 'config/options/adapt';
import basicConfig from 'config/options/baseConfiguration';
import css from 'config/options/css/css';
import data from 'config/options/data';
import debug from 'config/options/debug';
import defaults from 'config/defaults/options';
import complete from 'config/options/complete';
import computed from 'config/options/computed';
import magic from 'config/options/magic';
import template from 'config/options/template/template';

import parseOptions from 'config/options/groups/parseOptions';
import registries from 'config/options/groups/registries';


import warn from 'utils/warn';

var custom, options, config;

custom = {
	data: data,
	debug: debug,
	complete: complete,
	computed: computed,
	adapt: adapt,
	magic: magic,
	template: template,
	css: css
};

// fill in basicConfig for all default options not covered by
// registries, parse options, and any custom configuration
options = Object.keys( defaults )
	.filter( key => !registries[ key ] && !custom[ key ] && !parseOptions[ key ] )
	.map( key => basicConfig( { name: key } ) );

// this defines the order:
config = [].concat(
	custom.debug,
	custom.data,
	parseOptions,
	options,
	custom.adapt,
	custom.magic,
	custom.complete,
	custom.computed,
	registries,
	custom.template,
	custom.css
);

// for iteration
config.keys = config.map( config => config.name );

// for lookup and blacklist test
config.keys.forEach( ( key, i ) => {
	config[ key ] = config[ i ];
	config.keys[ key ] = true;
});

config.parseOptions = parseOptions;
config.registries = registries;


var message = 'ractive.eventDefinitions has been deprecated in favour of ractive.events. ';
function deprecateEventDefinitions ( options ) {

	// TODO remove support
	if ( options.eventDefinitions ) {

		if( !options.events ) {

			warn( message + ' Support will be removed in future versions.' );
			options.events = options.eventDefinitions;

		}
		else {

			throw new Error( message + ' You cannot specify both options, please use ractive.events.'  );

		}

	}
}

function deprecate ( options ) {

	deprecateEventDefinitions( options );
}

config.extend = function ( Parent, Child, options ) {

	deprecate( options );

	config.forEach( c => {
		c.extend( Parent, Child, options );
	});
};

config.init = function ( Parent, ractive, options ) {

	deprecate( options );


	// for ( let key in option ) {
	// 	ractive[ key ]
	// }

	config.forEach( c => {

		c.init( Parent, ractive, options );

		// this is done soley for init( options )
		options[ c.name ] = ractive[ c.name ];


	});

	if ( ractive._config ) {
		ractive._config.options = options;
	}
};

config.reset = function ( ractive ) {
	return config.filter( c => {
		return c.reset && c.reset( ractive );
	});
};

export default config;




