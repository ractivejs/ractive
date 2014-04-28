define([
	'config/types',
	'parse/Parser/converters/mustache/expression/logicalOr'
], function (
	types,
	logicalOr
) {

	'use strict';

	// The conditional operator is the lowest precedence operator, so we start here
	return function ( parser ) {
		var start, expression, ifTrue, ifFalse;

		expression = getLogicalOr( parser ); // next lowest precedence
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

		ifTrue = parser.getExpression();
		if ( !ifTrue ) {
			parser.pos = start;
			return expression;
		}

		parser.allowWhitespace();

		if ( !parser.matchString( ':' ) ) {
			parser.pos = start;
			return expression;
		}

		parser.allowWhitespace();

		ifFalse = parser.getExpression();
		if ( !ifFalse ) {
			parser.pos = start;
			return expression;
		}

		return {
			t: types.CONDITIONAL,
			o: [ expression, ifTrue, ifFalse ]
		};
	};

});
