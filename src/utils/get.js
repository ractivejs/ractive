/*global XMLHttpRequest */
define([
	'utils/Promise'
], function (
	Promise
) {

	'use strict';

	return function ( url ) {
		return new Promise( function ( resolve, reject ) {
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