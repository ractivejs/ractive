define(['config/types','parse/Parser/expressions/logicalOr','parse/Parser/expressions/shared/errors'],function (types, getLogicalOr, errors) {

	'use strict';
	
	return function ( parser ) {
		var start, expression, ifTrue, ifFalse;
	
		expression = getLogicalOr( parser );
		if ( !expression ) {
			return null;
		}
	
		start = parser.pos;
	
		parser.allowWhitespace();
	
		if ( !parser.matchString( '?' ) ) {
			parser.pos = start;
			return expression;
		}
	
		parser.allowWhitespace();
	
		ifTrue = parser.readExpression();
		if ( !ifTrue ) {
			parser.error( errors.expectedExpression );
		}
	
		parser.allowWhitespace();
	
		if ( !parser.matchString( ':' ) ) {
			parser.error( 'Expected ":"' );
		}
	
		parser.allowWhitespace();
	
		ifFalse = parser.readExpression();
		if ( !ifFalse ) {
			parser.error( errors.expectedExpression );
		}
	
		return {
			t: types.CONDITIONAL,
			o: [ expression, ifTrue, ifFalse ]
		};
	};

});