define([
	'config/types',
	'parse/getToken/utils/allowWhitespace',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/getMustacheOrTriple/getExpression/getTypeOf'
], function (
	types,
	allowWhitespace,
	getStringMatch,
	getTypeOf
) {
	
	'use strict';

	var getExpression, makeInfixSequenceMatcher;

	loadCircularDependency( function () {
		require([ 'parse/getToken/getMustacheOrTriple/getExpression/_index' ], function ( dep ) {
			getExpression = dep;
		});
	});
	
	makeInfixSequenceMatcher = function ( symbol, fallthrough ) {
		return function ( tokenizer ) {
			var start, left, right;

			left = fallthrough( tokenizer );
			if ( !left ) {
				return null;
			}

			start = tokenizer.pos;

			allowWhitespace( tokenizer );

			if ( !getStringMatch( tokenizer, symbol ) ) {
				tokenizer.pos = start;
				return left;
			}

			// special case - in operator must not be followed by [a-zA-Z_$0-9]
			if ( symbol === 'in' && /[a-zA-Z_$0-9]/.test( tokenizer.remaining().charAt( 0 ) ) ) {
				tokenizer.pos = start;
				return left;
			}

			allowWhitespace( tokenizer );

			right = getExpression( tokenizer );
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
	return (function () {
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
		return fallthrough;
	}());

});