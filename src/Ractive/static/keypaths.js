import { escapeKey, splitKeypath as splitKeypathI, unescapeKey } from '../../shared/keypaths';

export function joinKeypath ( ...keys ) {
	return keys.map( escapeKey ).join( '.' );
}

export function splitKeypath ( keypath ) {
	return splitKeypathI( keypath ).map( unescapeKey );
}
