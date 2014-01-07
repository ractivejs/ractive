define([
	'utils/isObject',
	'load/loadFromLinks',
	'load/loadMultiple',
	'load/loadSingle'
], function (
	isObject,
	loadFromLinks,
	loadMultiple,
	loadSingle
) {

	'use strict';

	return function ( url, callback ) {
		if ( !url || typeof url === 'function' ) {
			callback = url;
			return loadFromLinks( callback );
		}

		if ( isObject( url ) ) {
			return loadMultiple( url, callback );
		}

		return loadSingle( url, callback );
	};

});