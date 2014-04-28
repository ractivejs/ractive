define([
	'config/types',
	'parse/Tokenizer/getExpression/getMemberOrInvocation'
], function (
	types,
	getMemberOrInvocation
) {

	'use strict';

	var getTypeOf, makePrefixSequenceMatcher;

	makePrefixSequenceMatcher = function ( symbol, fallthrough ) {
		return function ( tokenizer ) {
			var start, expression;

			if ( !tokenizer.matchString( symbol ) ) {
				return fallthrough( tokenizer );
			}

			start = tokenizer.pos;

			tokenizer.allowWhitespace();

			expression = tokenizer.getExpression();
			if ( !expression ) {
				tokenizer.expected( 'an expression' );
			}

			return {
				s: symbol,
				o: expression,
				t: types.PREFIX_OPERATOR
			};
		};
	};

	// create all prefix sequence matchers, return getTypeOf
	(function () {
		var i, len, matcher, prefixOperators, fallthrough;

		prefixOperators = '! ~ + - typeof'.split( ' ' );

		fallthrough = getMemberOrInvocation;
		for ( i=0, len=prefixOperators.length; i<len; i+=1 ) {
			matcher = makePrefixSequenceMatcher( prefixOperators[i], fallthrough );
			fallthrough = matcher;
		}

		// typeof operator is higher precedence than multiplication, so provides the
		// fallthrough for the multiplication sequence matcher we're about to create
		// (we're skipping void and delete)
		getTypeOf = fallthrough;
	}());

	return getTypeOf;

});
