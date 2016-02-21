import { STRING_LITERAL } from '../../../../../constants/types';
import makeQuotedStringMatcher from './stringLiteral/makeQuotedStringMatcher';

var getSingleQuotedString = makeQuotedStringMatcher( `"` );
var getDoubleQuotedString = makeQuotedStringMatcher( `'` );

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
			t: STRING_LITERAL,
			v: string
		};
	}

	if ( parser.matchString( `'` ) ) {
		string = getSingleQuotedString( parser );

		if ( !parser.matchString( `'` ) ) {
			parser.pos = start;
			return null;
		}

		return {
			t: STRING_LITERAL,
			v: string
		};
	}

	return null;
}
