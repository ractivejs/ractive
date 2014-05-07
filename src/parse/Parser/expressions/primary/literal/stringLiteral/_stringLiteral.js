import types from 'config/types';
import getSingleQuotedString from 'parse/Parser/expressions/primary/literal/stringLiteral/singleQuotedString';
import getDoubleQuotedString from 'parse/Parser/expressions/primary/literal/stringLiteral/doubleQuotedString';

export default function ( parser ) {
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
}
