define([
	'config/types',
	'parse/Parser/expressions/primary/literal/stringLiteral/singleQuotedString',
	'parse/Parser/expressions/primary/literal/stringLiteral/doubleQuotedString',
], function (
	types,
	getSingleQuotedString,
	getDoubleQuotedString
) {

	'use strict';

	return function ( parser ) {
		var start, string;

		start = parser.pos;

		if ( parser.matchString( '"' ) ) {
			string = getDoubleQuotedString( parser );

			if ( !parser.matchString( '"' ) ) {
				parser.pos = start;
				return null;
			}

			return {
				t: types.STRING_LITERAL,
				v: string
			};
		}

		if ( parser.matchString( "'" ) ) {
			string = getSingleQuotedString( parser );

			if ( !parser.matchString( "'" ) ) {
				parser.pos = start;
				return null;
			}

			return {
				t: types.STRING_LITERAL,
				v: string
			};
		}

		return null;
	};

});
