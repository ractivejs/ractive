(function () {

	'use strict';

	var testDiv = document.createElement( 'div' );

	QUnit.assert.htmlEqual = function ( actual, expected, message ) {
		if ( !message ) {
			message = 'HTML should be equal';
		}

		this.deepEqual( normalize( actual ), normalize( expected ), message );
	};

	QUnit.assert.notHtmlEqual = function ( actual, expected, message ) {
		if ( !message ) {
			message = 'HTML should be equal';
		}

		this.notDeepEqual( normalize( actual ), normalize( expected ), message );
	};

	function normalize ( html ) {
		testDiv.innerHTML = trim( html );
		return stubNode( testDiv ).children || stubNode( testDiv ).text;
	}

	function trim ( str ) {
		if ( str.trim ) {
			return str.trim();
		}

		return str.replace( /^s+/, '' ).replace( /\s+$/, '' );
	}

	function stubNode ( node ) {
		var stub, i, attr;

		if ( node.nodeType === 3 ) {
			return node.data;
		}

		if ( node.nodeType === 1 ) {
			stub = { _tag: node.tagName };

			if ( ( node.childNodes.length === 1 ) && ( node.childNodes[0].nodeType === 3 ) ) {
				stub.text = node.childNodes[0].data;
			} else {
				stub.children = [];

				i = node.childNodes.length;
				while ( i-- ) {
					stub.children[i] = stubNode( node.childNodes[i] );
				}
			}

			if ( i = node.attributes.length ) {
				stub.attributes = {};
			}

			i = node.attributes.length;
			while ( i-- ) {
				attr = node.attributes[i];
				stub.attributes[ attr.name ] = attr.value || true;
			}

			return stub;
		}
	}

}());

