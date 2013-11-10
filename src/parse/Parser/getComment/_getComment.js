define([
	'config/types',
	'parse/Parser/getComment/CommentStub/_CommentStub'
], function (
	types,
	CommentStub
) {
	
	'use strict';

	return function ( token ) {
		if ( token.type === types.COMMENT ) {
			this.pos += 1;
			return new CommentStub( token, this.preserveWhitespace );
		}

		return null;
	};

});