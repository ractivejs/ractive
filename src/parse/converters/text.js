import getLowestIndex from 'parse/converters/utils/getLowestIndex';
import decodeCharacterReferences from 'parse/converters/utils/decodeCharacterReferences';

export default function ( parser ) {
	var index, remaining, barrier;

	remaining = parser.remaining();

	barrier = parser.inside ? '</' + parser.inside : '<';

	if ( parser.inside && !parser.interpolate[ parser.inside ] ) {
		index = remaining.indexOf( barrier );
	} else {
		index = getLowestIndex( remaining, [ barrier, parser.delimiters[0], parser.tripleDelimiters[0] ] );
	}

	if ( !index ) {
		return null;
	}

	if ( index === -1 ) {
		index = remaining.length;
	}

	parser.pos += index;

	return decodeCharacterReferences( remaining.substr( 0, index ) );
}
