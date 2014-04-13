define([
	'config/types'
], function (
	types
) {

	'use strict';

	return function () {
		var content, remaining, endIndex;

		if ( !this.getStringMatch( '<!--' ) ) {
			return null;
		}

		remaining = this.remaining();
		endIndex = remaining.indexOf( '-->' );

		if ( endIndex === -1 ) {
			throw new Error( 'Unexpected end of input (expected "-->" to close comment) on line '+this.getLinePos() );
		}

		content = remaining.substr( 0, endIndex );
		this.pos += endIndex + 3;

		return {
			type: types.COMMENT,
			content: content
		};
	};

});
