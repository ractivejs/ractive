define([ 'config/types' ], function ( types ) {

	'use strict';

	return function ( tokenizer ) {
		var start, expr;

		start = tokenizer.pos;

		if ( !tokenizer.getStringMatch( '(' ) ) {
			return null;
		}

		tokenizer.allowWhitespace();

		expr = tokenizer.getExpression();
		if ( !expr ) {
			tokenizer.pos = start;
			return null;
		}

		tokenizer.allowWhitespace();

		if ( !tokenizer.getStringMatch( ')' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			t: types.BRACKETED,
			x: expr
		};
	};

});
