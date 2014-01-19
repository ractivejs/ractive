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
		return stubNode( testDiv ).children;
	}

	function trim ( str ) {
		if ( str.trim ) {
			return str.trim();
		}

		return str.replace( /^s+/, '' ).replace( /\s+$/, '' );
	}

	function stubNode ( node ) {
		var stub, i;

		if ( node.nodeType === 3 ) {
			return node.data;
		}

		if ( node.nodeType === 1 ) {
			stub = { tag: node.tagName, children: [] };

			i = node.childNodes.length;
			while ( i-- ) {
				stub.children[i] = stubNode( node.childNodes[i] );
			}

			return stub;
		}
	}

}());

