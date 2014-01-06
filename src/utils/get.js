/*global XMLHttpRequest */
define([
	'utils/promise'
], function (
	promise
) {

	'use strict';

	return function ( url ) {
		return promise( function ( resolve, reject ) {
			var xhr = new XMLHttpRequest();

			xhr.open( 'GET', url );

			xhr.onload = function () {
				resolve( xhr.responseText );
			};

			xhr.onerror = reject;

			xhr.send();
		});
	};

});