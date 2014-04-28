define([
	'config/types'
], function (
	types
) {

	'use strict';

	var OPEN_COMMENT = '<!--',
		CLOSE_COMMENT = '-->';

	return function ( parser ) {
		var content, remaining, endIndex;

		if ( !parser.matchString( OPEN_COMMENT ) ) {
			return null;
		}

		remaining = parser.remaining();
		endIndex = remaining.indexOf( CLOSE_COMMENT );

		if ( endIndex === -1 ) {
			parser.error( 'Illegal HTML - expected closing comment sequence (\'-->\')' );
		}

		content = remaining.substr( 0, endIndex );
		parser.pos += endIndex + 3;

		return {
			t: types.COMMENT,
			c: content
		};
	};

});
