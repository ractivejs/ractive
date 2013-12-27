define([
	'config/types',
	'parse/Tokenizer/getExpression/getLogicalOr'
], function (
	types,
	getLogicalOr
) {

	'use strict';

	// The conditional operator is the lowest precedence operator, so we start here
	return function ( tokenizer ) {
		var start, expression, ifTrue, ifFalse;

		expression = getLogicalOr( tokenizer );
		if ( !expression ) {
			return null;
		}

		start = tokenizer.pos;

		tokenizer.allowWhitespace();

		if ( !tokenizer.getStringMatch( '?' ) ) {
			tokenizer.pos = start;
			return expression;
		}

		tokenizer.allowWhitespace();

		ifTrue = tokenizer.getExpression();
		if ( !ifTrue ) {
			tokenizer.pos = start;
			return expression;
		}

		tokenizer.allowWhitespace();

		if ( !tokenizer.getStringMatch( ':' ) ) {
			tokenizer.pos = start;
			return expression;
		}

		tokenizer.allowWhitespace();

		ifFalse = tokenizer.getExpression();
		if ( !ifFalse ) {
			tokenizer.pos = start;
			return expression;
		}

		return {
			t: types.CONDITIONAL,
			o: [ expression, ifTrue, ifFalse ]
		};
	};

});