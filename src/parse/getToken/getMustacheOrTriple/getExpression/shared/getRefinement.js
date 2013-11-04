define([
	'config/types',
	'parse/getToken/utils/fail',
	'parse/getToken/utils/allowWhitespace',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/getMustacheOrTriple/getExpression/shared/getName'
], function (
	types,
	fail,
	allowWhitespace,
	getStringMatch,
	getName
) {
	
	'use strict';

	var getExpression;

	loadCircularDependency( function () {
		require([ 'parse/getToken/getMustacheOrTriple/getExpression/_index' ], function ( dep ) {
			getExpression = dep;
		});
	});

	
	return function getRefinement ( tokenizer ) {
		var start, name, expr;

		start = tokenizer.pos;

		allowWhitespace( tokenizer );

		// "." name
		if ( getStringMatch( tokenizer, '.' ) ) {
			allowWhitespace( tokenizer );

			if ( name = getName( tokenizer ) ) {
				return {
					t: types.REFINEMENT,
					n: name
				};
			}

			fail( tokenizer, 'a property name' );
		}

		// "[" expression "]"
		if ( getStringMatch( tokenizer, '[' ) ) {
			allowWhitespace( tokenizer );

			expr = getExpression( tokenizer );
			if ( !expr ) {
				fail( tokenizer, 'an expression' );
			}

			allowWhitespace( tokenizer );

			if ( !getStringMatch( tokenizer, ']' ) ) {
				fail( tokenizer, '"]"' );
			}

			return {
				t: types.REFINEMENT,
				x: expr
			};
		}

		return null;
	};

});