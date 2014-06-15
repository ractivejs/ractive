import css from 'config/options/css/css';
import data from 'config/options/data';
import debug from 'config/options/debug';
import defaults from 'config/defaults/options';
import complete from 'config/options/complete';
import computed from 'config/options/computed';
import template from 'config/options/template/template';

import parseOptions from 'config/options/groups/parseOptions';
import registries from 'config/options/groups/registries';


import warn from 'utils/warn';
import isArray from 'utils/isArray';

var custom, options, config;

custom = {
	data: data,
	debug: debug,
	complete: complete,
	computed: computed,
	template: template,
	css: css
};


// fill in basicConfig for all default options not covered by
// registries, parse options, and any custom configuration

options = Object.keys( defaults )
	.filter( key => !registries[ key ] && !custom[ key ] && !parseOptions[ key ] );

// this defines the order:
config = [].concat(
	custom.debug,
	custom.data,
	parseOptions,
	options,
	custom.complete,
	custom.computed,
	registries,
	custom.template,
	custom.css
);

for( let key in custom ) {
	config[ key ] = custom[ key ];
}

// for iteration
config.keys = Object.keys( defaults ).concat( registries.map( r => r.name ) ).concat( [ 'css' ] );

config.parseOptions = parseOptions;
config.registries = registries;


function getMessage( deprecated, isError ) {
	return 'ractive.' + deprecated + ' has been deprecated in favour of ractive.events.' +
		isError ? ' You cannot specify both options, please use ractive.events.' : '';
}

function deprecate ( options, deprecated, correct ) {

	// TODO remove support
	if ( deprecated in options ) {

		if( !( correct in options ) ) {

			warn( getMessage( deprecated ) );

			options[ correct ] = options[ deprecated ];

		}
		else {

			throw new Error( getMessage( deprecated, true ) );

		}

	}
}

function deprecateEventDefinitions ( options ) {

	deprecate( options, 'eventDefinitions', 'events' );
}

function depricateAdaptors ( options ) {

	// Using extend with Component instead of options,
	// like Human.extend( Spider ) means adaptors as a registry
	// gets copied to options. So we have to check if actually an array
	if ( 'adaptors' in options && isArray( options.adaptors ) ) {

		deprecate( options, 'adaptors', 'adapt' );

	}

}

function deprecateOptions ( options ) {
	deprecateEventDefinitions( options );
	depricateAdaptors( options );
}

function customConfig ( method, key, Parent, instance, options ) {
	custom[ key ][ method ]( Parent, instance, options );
}

config.extend = function ( Parent, proto, options ) {

	configure ( 'extend', Parent, proto, options );
};

config.init = function ( Parent, ractive, options ) {

	configure ( 'init', Parent, ractive, options );

	if ( ractive._config ) {
		ractive._config.options = options;
	}

	// would be nice to not have to do this.
	// currently for init method
	config.keys.forEach( key => {
		options[ key ] = ractive[ key ];
	});
};

function configure ( method, Parent, instance, options ) {

	deprecateOptions( options );

	customConfig( method, 'data', Parent, instance, options );
	customConfig( method, 'debug', Parent, instance, options );

	config.parseOptions.forEach( key => {

		if( key in options ) {
			instance[ key ] = options[ key ];
		}

	})

	for ( let key in options ) {
		if( key in defaults && !( key in config.parseOptions ) && !( key in custom ) ) {
			instance[ key ] = options[ key ];
		}
	}

	customConfig( method, 'complete', Parent, instance, options );
	customConfig( method, 'computed', Parent, instance, options );

	config.registries.forEach( registry => {
		registry[ method ]( Parent, instance, options );
	});

	customConfig( method, 'template', Parent, instance, options );
	customConfig( method, 'css', Parent, instance, options );

}

config.reset = function ( ractive ) {
	return config.filter( c => {
		return c.reset && c.reset( ractive );
	});
};

export default config;




