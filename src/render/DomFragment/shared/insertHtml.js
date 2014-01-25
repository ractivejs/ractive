define([
	'utils/createElement'
], function (
	createElement
) {

	'use strict';

	var elementCache = {}, ieBug, ieBlacklist;

	try {
		createElement( 'table' ).innerHTML = 'foo';
	} catch ( err ) {
		ieBug = true;

		ieBlacklist = {
			TABLE:  [ '<table class="x">', '</table>' ],
			THEAD:  [ '<table><thead class="x">', '</thead></table>' ],
			TBODY:  [ '<table><tbody class="x">', '</tbody></table>' ],
			TR:     [ '<table><tr class="x">', '</tr></table>' ],
			SELECT: [ '<select class="x">', '</select>' ]
		}
	}

	return function ( html, tagName, docFrag ) {
		var container, nodes = [], wrapper;

		if ( html ) {
			if ( ieBug && ( wrapper = ieBlacklist[ tagName ] ) ) {
				container = element( 'DIV' );
				container.innerHTML = wrapper[0] + html + wrapper[1];
				container = container.querySelector( '.x' );
			}

			else {
				container = element( tagName );
				container.innerHTML = html;
			}

			while ( container.firstChild ) {
				nodes.push( container.firstChild );
				docFrag.appendChild( container.firstChild );
			}
		}

		return nodes;
	};

	function element ( tagName ) {
		return elementCache[ tagName ] || ( elementCache[ tagName ] = createElement( tagName ) );
	}

});