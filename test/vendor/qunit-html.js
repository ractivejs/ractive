(function () {

	'use strict';

	var testDiv = document.createElement( 'div' ), svgns = 'http://www.w3.org/2000/svg';

	QUnit.assert.htmlEqual = window.htmlEqual = function ( actual, expected, message ) {
		if ( !message ) {
			message = 'HTML should be equal';
		}

		this.deepEqual( normalize( actual ), normalize( expected ), message );
	};

	function normalize ( html ) {
		testDiv.innerHTML = trim( html );
		return stubNode( testDiv ).children || stubNode( testDiv ).text;
	}

	function trim ( str ) {
		return str.replace( /^( |\r?\n)+/, '' ).replace( /( |\r?\n)+$/, '' );
	}

	function stubNode ( node ) {
		var stub, i, len, children, childStub, attributes, hasAttributes, attr;

		if ( node.nodeType === 3 ) {
			// exclude whitespace. This is for the benefit of IE, which
			// mangles innerHTML horrifically
			if ( /^\s+$/.test( node.data ) ) {
				return null;
			}

			return node.data;
		}

		if ( node.nodeType === 1 ) {
			stub = { _tag: node.tagName };

			if ( ( node.childNodes.length === 1 ) && ( node.childNodes[0].nodeType === 3 ) ) {
				stub.text = node.childNodes[0].data;
			} else if ( len = node.childNodes.length ) {
				children = [];

				for ( i = 0; i < len; i += 1 ) {
					if ( childStub = stubNode( node.childNodes[i] ) ) {
						children.push( childStub );
					}
				}

				if ( children.length ) {
					stub.children = children;
				}
			}

			if ( i = node.attributes.length ) {
				attributes = {};
			}

			i = node.attributes.length;
			while ( i-- ) {
				attr = node.attributes[i];
				if ( attr.value && ( attr.name !== 'value' && attr.value !== svgns ) ) { // last bit for IE...
					if ( typeof node[ attr.name ] === 'boolean' ) {
						attributes[ attr.name ] = true;
					} else {
						attributes[ attr.name ] = attr.value;
					}

					hasAttributes = true;
				}
			}

			if ( hasAttributes ) {
				stub.attributes = attributes;
			}

			return stub;
		}
	}

}());
