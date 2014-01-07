define([
	'utils/promise',
	'registries/components',
	'load/loadSingle',
	'load/getName'
], function (
	promise,
	componentsRegistry,
	loadSingle,
	getName
) {

	'use strict';

	return function ( callback, onerror ) {
		var p = promise( function ( resolve, reject ) {
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
			p.then( callback, onerror );
		}

		return p;
	};

	function getNameFromLink ( link ) {
		return link.getAttribute( 'name' ) || getName( link.getAttribute( 'href' ) );
	}

});