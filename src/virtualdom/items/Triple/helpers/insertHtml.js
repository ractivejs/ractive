import { namespaces } from 'config/environment';
import { createElement } from 'utils/dom';

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
	};
}

export default function ( html, node, docFrag ) {
	var container, nodes = [], wrapper, selectedOption, child, i;

	// render 0 and false
	if ( html != null && html !== '' ) {
		if ( ieBug && ( wrapper = ieBlacklist[ node.tagName ] ) ) {
			container = element( 'DIV' );
			container.innerHTML = wrapper[0] + html + wrapper[1];
			container = container.querySelector( '.x' );

			if ( container.tagName === 'SELECT' ) {
				selectedOption = container.options[ container.selectedIndex ];
			}
		}

		else if ( node.namespaceURI === namespaces.svg ) {
			container = element( 'DIV' );
			container.innerHTML = '<svg class="x">' + html + '</svg>';
			container = container.querySelector( '.x' );
		}

		else {
			container = element( node.tagName );
			container.innerHTML = html;

			if ( container.tagName === 'SELECT' ) {
				selectedOption = container.options[ container.selectedIndex ];
			}
		}

		while ( child = container.firstChild ) {
			nodes.push( child );
			docFrag.appendChild( child );
		}

		// This is really annoying. Extracting <option> nodes from the
		// temporary container <select> causes the remaining ones to
		// become selected. So now we have to deselect them. IE8, you
		// amaze me. You really do
		// ...and now Chrome too
		if ( node.tagName === 'SELECT' ) {
			i = nodes.length;
			while ( i-- ) {
				if ( nodes[i] !== selectedOption ) {
					nodes[i].selected = false;
				}
			}
		}
	}

	return nodes;
}

function element ( tagName ) {
	return elementCache[ tagName ] || ( elementCache[ tagName ] = createElement( tagName ) );
}
