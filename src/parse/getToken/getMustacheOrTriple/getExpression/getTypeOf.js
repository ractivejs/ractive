define([
	'config/types',
	'parse/getToken/utils/fail',
	'parse/getToken/utils/allowWhitespace',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/getMustacheOrTriple/getExpression/getMemberOrInvocation'
], function (
	types,
	fail,
	allowWhitespace,
	getStringMatch,
	getMemberOrInvocation
) {
	
	'use strict';

	var getExpression;

	loadCircularDependency( function () {
		require([ 'parse/getToken/getMustacheOrTriple/getExpression/_index' ], function ( dep ) {
			getExpression = dep;
		});
	});

	
	// right-to-left
	var makePrefixSequenceMatcher = function ( symbol, fallthrough ) {
		return function ( tokenizer ) {
			var start, expression;

			if ( !getStringMatch( tokenizer, symbol ) ) {
				return fallthrough( tokenizer );
			}

			start = tokenizer.pos;

			allowWhitespace( tokenizer );

			expression = getExpression( tokenizer );
			if ( !expression ) {
				fail( tokenizer, 'an expression' );
			}

			return {
				s: symbol,
				o: expression,
				t: types.PREFIX_OPERATOR
			};
		};
	};

	// create all prefix sequence matchers, return getTypeOf
	return (function () {
		var i, len, matcher, prefixOperators, fallthrough;

		prefixOperators = '! ~ + - typeof'.split( ' ' );

		// An invocation refinement is higher precedence than logical-not
		//fallthrough = getInvocationRefinement;
		fallthrough = getMemberOrInvocation;
		for ( i=0, len=prefixOperators.length; i<len; i+=1 ) {
			matcher = makePrefixSequenceMatcher( prefixOperators[i], fallthrough );
			fallthrough = matcher;
		}

		// typeof operator is higher precedence than multiplication, so provides the
		// fallthrough for the multiplication sequence matcher we're about to create
		// (we're skipping void and delete)
		return fallthrough;
	}());

});