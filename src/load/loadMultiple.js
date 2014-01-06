define([
	'utils/promise',
	'load/loadSingle'
], function (
	promise,
	loadSingle
) {

	'use strict';

	return function ( map, callback, onerror ) {
		var p = promise( function ( resolve, reject ) {
			var pending = 0, result = {}, name, load;

			load = function ( name ) {
				var url = map[ name ];

				loadSingle( url ).then( function ( Component ) {
					result[ name ] = Component;

					if ( !--pending ) {
						resolve( result );
					}
				}, reject );
			};

			for ( name in map ) {
				if ( map.hasOwnProperty( name ) ) {
					pending += 1;
					load( name );
				}
			}
		});

		if ( callback ) {
			p.then( callback, onerror );
		}

		return p;
	};

});