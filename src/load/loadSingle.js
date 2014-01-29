define([
	'circular',
	'utils/get',
	'utils/Promise',
	'utils/resolvePath',
	'load/makeComponent'
], function (
	circular,
	get,
	promise,
	resolvePath,
	makeComponent
) {

	'use strict';

	var Ractive;

	circular.push( function () {
		Ractive = circular.Ractive;
	});

	return function ( path, callback, onerror ) {
		var promise, url;

		url = resolvePath( path, Ractive.baseUrl, true );

		promise = get( url ).then( function ( template ) {
			return makeComponent( template, url );
		}, throwError );

		if ( callback ) {
			promise.then( callback, onerror );
		}

		return promise;
	};

	function throwError ( err ) {
		throw err;
	}

});
