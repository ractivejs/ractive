define([
	'utils/Promise',
	'load/loadSingle'
], function (
	Promise,
	loadSingle
) {

	'use strict';

	return function ( map, callback, onerror ) {
		var promise = new Promise( function ( resolve, reject ) {
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
			promise.then( callback, onerror );
		}

		return promise;
	};

});
