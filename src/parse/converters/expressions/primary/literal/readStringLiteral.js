import { STRING_LITERAL } from '../../../../../config/types';
import makeQuotedStringMatcher from './stringLiteral/makeQuotedStringMatcher';

const singleMatcher = makeQuotedStringMatcher( `"` );
const doubleMatcher = makeQuotedStringMatcher( `'` );

export default function ( parser ) {
	const start = parser.pos;
	const quote = parser.matchString( `'` ) || parser.matchString( `"` );

	if ( quote ) {
		const string = ( quote === `'` ? singleMatcher : doubleMatcher )( parser );

		if ( !parser.matchString( quote ) ) {
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
