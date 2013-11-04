define([
	'config/types',
	'parse/getToken/utils/getStringMatch'
], function (
	types,
	getStringMatch
) {

	'use strict';

	return function ( tokenizer ) {
		var content, remaining, endIndex;

		if ( !getStringMatch( tokenizer, '<!--' ) ) {
			return null;
		}

		remaining = tokenizer.remaining();
		endIndex = remaining.indexOf( '-->' );

		if ( endIndex === -1 ) {
			throw new Error( 'Unexpected end of input (expected "-->" to close comment)' );
		}

		content = remaining.substr( 0, endIndex );
		tokenizer.pos += endIndex + 3;

		return {
			type: types.COMMENT,
			content: content
		};
	};

});