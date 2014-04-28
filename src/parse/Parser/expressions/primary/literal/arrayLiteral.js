define([
	'config/types',
	'parse/Parser/expressions/shared/expressionList'
], function (
	types,
	getExpressionList
) {

	'use strict';

	return function ( parser ) {
		var start, expressionList;

		start = parser.pos;

		// allow whitespace before '['
		parser.allowWhitespace();

		if ( !parser.matchString( '[' ) ) {
			parser.pos = start;
			return null;
		}

		expressionList = getExpressionList( parser );

		if ( !parser.matchString( ']' ) ) {
			parser.pos = start;
			return null;
		}

		return {
			t: types.ARRAY_LITERAL,
			m: expressionList
		};
	};

});
