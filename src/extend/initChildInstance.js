define([
	'config/initOptions',
	'extend/wrapMethod',
	'Ractive/initialise'
], function (
	initOptions,
	wrapMethod,
	initialise
) {

	'use strict';

	// The Child constructor contains the default init options for this class

	return function initChildInstance ( child, Child, options ) {

		initOptions.keys.forEach( function ( key ) {
			var value = options[ key ], defaultValue = Child.defaults[ key ];

			if ( typeof value === 'function' && typeof defaultValue === 'function' ) {
				options[ key ] = wrapMethod( value, defaultValue );
			}
		});

		if ( child.beforeInit ) {
			child.beforeInit( options );
		}

		initialise( child, options );

		if ( child.init ) {
			child.init( options );
		}
	};

});
