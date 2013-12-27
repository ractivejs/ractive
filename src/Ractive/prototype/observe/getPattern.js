define( function () {

	'use strict';

	return function ( ractive, pattern ) {
		var keys, key, values, toGet, newToGet, expand, concatenate;

		keys = pattern.split( '.' );
		toGet = [];

		expand = function ( keypath ) {
			var value, key;

			value = ( ractive._wrapped[ keypath ] ? ractive._wrapped[ keypath ].get() : ractive.get( keypath ) );

			for ( key in value ) {
				newToGet.push( keypath + '.' + key );
			}
		};

		concatenate = function ( keypath ) {
			return keypath + '.' + key;
		};

		while ( key = keys.shift() ) {
			if ( key === '*' ) {
				newToGet = [];

				toGet.forEach( expand );
				toGet = newToGet;
			}

			else {
				if ( !toGet[0] ) {
					toGet[0] = key;
				} else {
					toGet = toGet.map( concatenate );
				}
			}
		}

		values = {};

		toGet.forEach( function ( keypath ) {
			values[ keypath ] = ractive.get( keypath );
		});

		return values;
	};

});