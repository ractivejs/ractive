define([ 'parse/Parser/utils/stringifyStubs' ], function ( stringifyStubs ) {

	'use strict';

	return function ( items, noStringify, topLevel ) {
		var str, json;

		if ( !topLevel && !noStringify ) {
			str = stringifyStubs( items );
			if ( str !== false ) {
				return str;
			}
		}

		json = items.map( function ( item ) {
			return item.toJSON( noStringify );
		});

		return json;
	};

});
