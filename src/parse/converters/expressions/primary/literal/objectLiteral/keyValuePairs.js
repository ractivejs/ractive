import getKeyValuePair from './keyValuePair';

export default function readKeyValuePairs ( parser ) {
	var start, pairs, pair, keyValuePairs;

	start = parser.pos;

	pair = getKeyValuePair( parser );
	if ( pair === null ) {
		return null;
	}

	pairs = [ pair ];

	if ( parser.matchString( ',' ) ) {
		keyValuePairs = readKeyValuePairs( parser );

		if ( !keyValuePairs ) {
			parser.pos = start;
			return null;
		}

		return pairs.concat( keyValuePairs );
	}

	return pairs;
}
