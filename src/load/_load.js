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

	return function ( url, callback, onError ) {
		if ( !url || typeof url === 'function' ) {
			callback = url;
			return loadFromLinks( callback, onError );
		}

		if ( isObject( url ) ) {
			return loadMultiple( url, callback, onError );
		}

		return loadSingle( url, callback, onError );
	};

});