define([
	'config/errors',
	'parse/_parse'
], function (
	errors,
	parse
) {
	
	'use strict';

	return function ( Child ) {
		var key, partial;

		// Parse partials, if necessary
		if ( Child.partials ) {
			for ( key in Child.partials ) {
				if ( Child.partials.hasOwnProperty( key ) ) {
					if ( typeof Child.partials[ key ] === 'string' ) {
						if ( !parse ) {
							throw new Error( errors.missingParser );
						}

						partial = parse( Child.partials[ key ], Child );
					} else {
						partial = Child.partials[ key ];
					}

					Child.partials[ key ] = partial;
				}
			}
		}
	};

});