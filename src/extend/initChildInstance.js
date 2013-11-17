define([
	'extend/extendable',
	'extend/inheritable',
	'extend/utils/clone',
	'extend/utils/fillGaps',
	'Ractive/initialise'
], function (
	extendable,
	inheritable,
	clone,
	fillGaps,
	initialise
) {
	
	'use strict';

	return function ( child, Child, options ) {
		
		// Add template to options, if necessary
		if ( !options.template && Child.template ) {
			options.template = Child.template;
		}

		extendable.forEach( function ( property ) {
			if ( !options[ property ] ) {
				if ( Child[ property ] ) {
					options[ property ] = clone( Child[ property ] );
				}
			} else {
				fillGaps( options[ property ], Child[ property ] );
			}
		});
		
		inheritable.forEach( function ( property ) {
			if ( options[ property ] === undefined && Child[ property ] !== undefined ) {
				options[ property ] = Child[ property ];
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