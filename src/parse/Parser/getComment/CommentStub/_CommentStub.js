define([ 'config/types' ], function ( types ) {

	'use strict';

	var CommentStub;

	CommentStub = function ( token ) {
		this.content = token.content;
	};

	CommentStub.prototype = {
		toJSON: function () {
			return {
				t: types.COMMENT,
				f: this.content
			};
		},

		toString: function () {
			return '<!--' + this.content + '-->';
		}
	};

	return CommentStub;

});
