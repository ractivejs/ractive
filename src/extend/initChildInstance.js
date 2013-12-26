define([
	'utils/fillGaps',
	'extend/initOptions',
	'extend/utils/clone',
	'extend/wrapMethod',
	'Ractive/initialise'
], function (
	fillGaps,
	initOptions,
	clone,
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

		if ( child.beforeInit ) {
			child.beforeInit( options );
		}

		initialise( child, options );

		if ( child.init ) {
			child.init( options );
		}
	};

});