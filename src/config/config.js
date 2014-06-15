import basicConfig from 'config/options/baseConfiguration';
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
	.filter( key => !registries[ key ] && !custom[ key ] && !parseOptions[ key ] )
	.map( key => basicConfig( { name: key } ) );

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

// for iteration
config.keys = config.map( config => config.name );

// for lookup and blacklist test
config.keys.forEach( ( key, i ) => {
	config[ key ] = config[ i ];
	config.keys[ key ] = true;
});

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

config.extend = function ( Parent, Child, options ) {

	deprecateOptions( options );

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




