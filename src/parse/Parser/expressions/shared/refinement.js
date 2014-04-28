define([
	'config/types',
	'parse/Parser/expressions/patterns'
], function (
	types,
	patterns
) {

	'use strict';

	return function getRefinement ( parser ) {
		var start, name, expr;

		start = parser.pos;

		parser.allowWhitespace();

		// "." name
		if ( parser.matchString( '.' ) ) {
			parser.allowWhitespace();

			if ( name = parser.matchPattern( patterns.name ) ) {
				return {
					t: types.REFINEMENT,
					n: name
				};
			}

			parser.expected( 'a property name' );
		}

		// "[" expression "]"
		if ( parser.matchString( '[' ) ) {
			parser.allowWhitespace();

			expr = parser.readExpression();
			if ( !expr ) {
				parser.expected( 'an expression' );
			}

			parser.allowWhitespace();

			if ( !parser.matchString( ']' ) ) {
				parser.expected( '"]"' );
			}

			return {
				t: types.REFINEMENT,
				x: expr
			};
		}

		return null;
	};

});
