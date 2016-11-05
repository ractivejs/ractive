import { STRING_LITERAL } from '../../../../../config/types';
import makeQuotedStringMatcher from './stringLiteral/makeQuotedStringMatcher';

const getSingleQuotedString = makeQuotedStringMatcher( `"` );
const getDoubleQuotedString = makeQuotedStringMatcher( `'` );

export default function ( parser ) {
	const start = parser.pos;

	if ( parser.matchString( '"' ) ) {
		const string = getDoubleQuotedString( parser );

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
		const string = getSingleQuotedString( parser );

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
