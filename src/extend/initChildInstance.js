define([
	'extend/initOptions',
	'extend/utils/clone',
	'extend/utils/fillGaps',
	'extend/wrapMethod',
	'Ractive/initialise'
], function (
	initOptions,
	clone,
	fillGaps,
	wrapMethod,
	initialise
) {

	'use strict';

	// The Child constructor contains the default init options for this class

	return function ( child, Child, options ) {

		initOptions.forEach( function ( property ) {
			var value = options[ property ], defaultValue = Child[ property ];

			if ( typeof value === 'function' && typeof defaultValue === 'function' ) {
				options[ property ] = wrapMethod( value, defaultValue );
			}

			else if ( value === undefined && defaultValue !== undefined ) {
				options[ property ] = defaultValue;
			}
		});

		if ( Child.data ) {
			options.data = fillGaps( options.data || {}, Child.data );
		}

		if ( child.beforeInit ) {
			child.beforeInit( options );
		}

		initialise( child, options );

		if ( child.init ) {
			child.init( options );
		}
	};

});