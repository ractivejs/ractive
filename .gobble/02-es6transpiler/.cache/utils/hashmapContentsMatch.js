define(['utils/isObject','legacy'],function (isObject) {

	'use strict';
	
	return function hashmapContentsMatch ( a, b ) {
		var aKeys, bKeys;
	
		if ( !isObject( a ) || !isObject( b ) ) {
			return false;
		}
	
		if ( a === b ) {
			return true;
		}
	
		aKeys = Object.keys( a );
		bKeys = Object.keys( b );
	
		if ( aKeys.length !== bKeys.length ) {
			return false;
		}
	
		return aKeys.every( function ( key ) {
			return a[ key ] === b[ key ];
		});
	};

});