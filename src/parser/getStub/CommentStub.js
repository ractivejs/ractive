var CommentStub = function ( token ) {
	this.content = token.content;
};

CommentStub.prototype = {
	toJSON: function () {
		return {
			t: COMMENT,
			f: this.content
		};
	},

	toString: function () {
		return '<!--' + this.content + '-->';
	}
};