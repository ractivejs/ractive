define([ 'parse/Parser/utils/stringifyStubs' ], function ( stringifyStubs ) {

	'use strict';

	return function ( items, noStringify, topLevel ) {
		var str, json;

		/*if ( !topLevel && !noStringify ) {
			str = stringifyStubs( items );
			if ( str !== false ) {
				return str;
			}
		}*/

		json = items.map( function ( item ) {
			var result;

			// TEMP - this will be removed shortly
			if ( item.toJSON ) {
				result = item.toJSON( noStringify );
				return result;
			}

			return item;
		});

		return json;
	};

});
