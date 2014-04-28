define([
	'config/types'
], function (
	types
) {

	'use strict';

	var OPEN_COMMENT = '<!--',
		CLOSE_COMMENT = '-->',
		ignore = { ignore: true };

	return function ( parser ) {
		var content, remaining, endIndex;

		if ( !parser.matchString( OPEN_COMMENT ) ) {
			return null;
		}

		remaining = parser.remaining();
		endIndex = remaining.indexOf( CLOSE_COMMENT );

		if ( endIndex === -1 ) {
			parser.expected( CLOSE_COMMENT );
		}

		content = remaining.substr( 0, endIndex );
		parser.pos += endIndex + 3;

		return parser.stripComments ? ignore : {
			t: types.COMMENT,
			c: content
		};
	};

});
