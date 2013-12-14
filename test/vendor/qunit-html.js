(function () {

	'use strict';

	var testDiv = document.createElement( 'div' );

	QUnit.assert.htmlEqual = function ( actual, expected, message ) {
		if ( !message ) {
			message = 'HTML should be equal';
		}

		this.equal( normalize( actual ), normalize( expected ), message );
	};

	QUnit.assert.notHtmlEqual = function ( actual, expected, message ) {
		if ( !message ) {
			message = 'HTML should be equal';
		}

		this.notEqual( normalize( actual ), normalize( expected ), message );
	};

	function normalize ( html ) {
		testDiv.innerHTML = html;
		return trim( testDiv.innerHTML );
	}

	function trim ( str ) {
		if ( str.trim ) {
			return str.trim();
		}

		return str.replace( /^s+/, '' ).replace( /\s+$/, '' );
	}

}());

