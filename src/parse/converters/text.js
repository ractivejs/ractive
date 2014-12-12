import getLowestIndex from './utils/getLowestIndex';
import { decodeCharacterReferences } from 'utils/html';

export default function ( parser ) {
	var index, remaining, disallowed, barrier;

	remaining = parser.remaining();

	barrier = parser.inside ? '</' + parser.inside : '<';

	if ( parser.inside && !parser.interpolate[ parser.inside ] ) {
		index = remaining.indexOf( barrier );
	} else {
		disallowed = [
			parser.delimiters[0],
			parser.tripleDelimiters[0],
			parser.staticDelimiters[0],
			parser.staticTripleDelimiters[0]
		];

		// http://developers.whatwg.org/syntax.html#syntax-attributes
		if ( parser.inAttribute === true ) {
			// we're inside an unquoted attribute value
			disallowed.push( '"', "'", '=', '<', '>', '`' );
		} else if ( parser.inAttribute ) {
			// quoted attribute value
			disallowed.push( parser.inAttribute );
		} else {
			disallowed.push( barrier );
		}

		index = getLowestIndex( remaining, disallowed );
	}

	if ( !index ) {
		return null;
	}

	if ( index === -1 ) {
		index = remaining.length;
	}

	parser.pos += index;

	return parser.inside ? remaining.substr( 0, index ) : decodeCharacterReferences( remaining.substr( 0, index ) );
}
