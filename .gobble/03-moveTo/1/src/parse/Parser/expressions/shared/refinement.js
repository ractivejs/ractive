define(['config/types','parse/Parser/expressions/shared/errors','parse/Parser/expressions/shared/patterns'],function (types, errors, patterns) {

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
	
			parser.error( 'Expected a property name' );
		}
	
		// "[" expression "]"
		if ( parser.matchString( '[' ) ) {
			parser.allowWhitespace();
	
			expr = parser.readExpression();
			if ( !expr ) {
				parser.error( errors.expectedExpression );
			}
	
			parser.allowWhitespace();
	
			if ( !parser.matchString( ']' ) ) {
				parser.error( 'Expected \']\'' );
			}
	
			return {
				t: types.REFINEMENT,
				x: expr
			};
		}
	
		return null;
	};

});