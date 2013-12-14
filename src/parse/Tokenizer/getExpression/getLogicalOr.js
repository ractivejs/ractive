define([
	'config/types',
	'parse/Tokenizer/getExpression/getTypeOf'
], function (
	types,
	getTypeOf
) {
	
	'use strict';

	var getLogicalOr, makeInfixSequenceMatcher;

	makeInfixSequenceMatcher = function ( symbol, fallthrough ) {
		return function ( tokenizer ) {
			var start, left, right;

			left = fallthrough( tokenizer );
			if ( !left ) {
				return null;
			}

			start = tokenizer.pos;

			tokenizer.allowWhitespace();

			if ( !tokenizer.getStringMatch( symbol ) ) {
				tokenizer.pos = start;
				return left;
			}

			// special case - in operator must not be followed by [a-zA-Z_$0-9]
			if ( symbol === 'in' && /[a-zA-Z_$0-9]/.test( tokenizer.remaining().charAt( 0 ) ) ) {
				tokenizer.pos = start;
				return left;
			}

			tokenizer.allowWhitespace();

			right = tokenizer.getExpression();
			if ( !right ) {
				tokenizer.pos = start;
				return left;
			}

			return {
				t: types.INFIX_OPERATOR,
				s: symbol,
				o: [ left, right ]
			};
		};
	};

	// create all infix sequence matchers, and return getLogicalOr
	(function () {
		var i, len, matcher, infixOperators, fallthrough;

		// All the infix operators on order of precedence (source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Operator_Precedence)
		// Each sequence matcher will initially fall through to its higher precedence
		// neighbour, and only attempt to match if one of the higher precedence operators
		// (or, ultimately, a literal, reference, or bracketed expression) already matched
		infixOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split( ' ' );

		// A typeof operator is higher precedence than multiplication
		fallthrough = getTypeOf;
		for ( i=0, len=infixOperators.length; i<len; i+=1 ) {
			matcher = makeInfixSequenceMatcher( infixOperators[i], fallthrough );
			fallthrough = matcher;
		}

		// Logical OR is the fallthrough for the conditional matcher
		getLogicalOr = fallthrough;
	}());

	return getLogicalOr;

});