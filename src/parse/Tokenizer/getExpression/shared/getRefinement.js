define([
	'config/types',
	'parse/Tokenizer/getExpression/shared/getName'
], function (
	types,
	getName
) {

	'use strict';

	return function getRefinement ( tokenizer ) {
		var start, name, expr;

		start = tokenizer.pos;

		tokenizer.allowWhitespace();

		// "." name
		if ( tokenizer.getStringMatch( '.' ) ) {
			tokenizer.allowWhitespace();

			if ( name = getName( tokenizer ) ) {
				return {
					t: types.REFINEMENT,
					n: name
				};
			}

			tokenizer.expected( 'a property name' );
		}

		// "[" expression "]"
		if ( tokenizer.getStringMatch( '[' ) ) {
			tokenizer.allowWhitespace();

			expr = tokenizer.getExpression();
			if ( !expr ) {
				tokenizer.expected( 'an expression' );
			}

			tokenizer.allowWhitespace();

			if ( !tokenizer.getStringMatch( ']' ) ) {
				tokenizer.expected( '"]"' );
			}

			return {
				t: types.REFINEMENT,
				x: expr
			};
		}

		return null;
	};

});