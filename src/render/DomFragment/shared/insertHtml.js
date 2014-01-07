define([
	'utils/createElement'
], function (
	createElement
) {

	'use strict';

	var elementCache = {};

	return function ( html, tagName, docFrag ) {
		var container, nodes = [];

		if ( html ) {
			container = elementCache[ tagName ] || ( elementCache[ tagName ] = createElement( tagName ) );
			container.innerHTML = html;

			while ( container.firstChild ) {
				nodes.push( container.firstChild );
				docFrag.appendChild( container.firstChild );
			}
		}

		return nodes;
	};

});