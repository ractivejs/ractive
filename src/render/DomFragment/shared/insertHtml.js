define( function () {

	'use strict';

	var elementCache = {};

	return function ( html, tagName, docFrag ) {
		var container, nodes = [];

		if ( html ) {
			container = elementCache[ tagName ] || ( elementCache[ tagName ] = document.createElement( tagName ) );
			container.innerHTML = html;

			while ( container.firstChild ) {
				nodes[ nodes.length ] = container.firstChild;
				docFrag.appendChild( container.firstChild );
			}
		}

		return nodes;
	};

});