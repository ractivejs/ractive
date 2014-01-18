define([
	'utils/Promise',
	'registries/components',
	'load/loadSingle',
	'load/getName'
], function (
	Promise,
	componentsRegistry,
	loadSingle,
	getName
) {

	'use strict';

	return function ( callback, onerror ) {
		var promise = new Promise( function ( resolve, reject ) {
			var links, pending;

			links = Array.prototype.slice.call( document.querySelectorAll( 'link[rel="ractive"]' ) );
			pending = links.length;

			links.forEach( function ( link ) {
				var name = getNameFromLink( link );

				loadSingle( link.getAttribute( 'href' ) ).then( function ( Component ) {
					componentsRegistry[ name ] = Component;

					if ( !--pending ) {
						resolve();
					}
				}, reject );
			});
		});

		if ( callback ) {
			promise.then( callback, onerror );
		}

		return promise;
	};

	function getNameFromLink ( link ) {
		return link.getAttribute( 'name' ) || getName( link.getAttribute( 'href' ) );
	}

});