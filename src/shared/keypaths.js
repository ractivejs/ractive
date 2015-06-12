import { isArray } from 'utils/is';

let refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

export function getMatchingKeypaths ( ractive, keypath ) {
	var keys, key, matchingKeypaths;

	keys = keypath.split( '.' );
	matchingKeypaths = [ '' ];


	while ( key = keys.shift() ) {
		if ( key === '*' ) {
			// expand to find all valid child keypaths
			matchingKeypaths = matchingKeypaths.reduce( expand, [] );
		}

		else {
			if ( matchingKeypaths[0] === ractive.viewmodel.root ) { // first key
				matchingKeypaths[0] = ractive.viewmodel.getContext( key );
			} else {
				matchingKeypaths = matchingKeypaths.map( concatenate( key ) );
			}
		}
	}

	return matchingKeypaths;

	function expand ( matchingKeypaths, keypath ) {

		var wrapper, value, keys;

		if ( keypath === '' ) {
			keys = [].concat(
				Object.keys( ractive.viewmodel.data ),
				Object.keys( ractive.viewmodel.mappings ),
				Object.keys( ractive.viewmodel.computations )
			);
		} else {
			value = ractive.viewmodel.getContext( keypath ).get();

			keys = value ? Object.keys( value ) : null;
		}

		if ( keys ) {
			keys.forEach( key => {
				if ( key !== '_ractive' || !isArray( value ) ) {
					matchingKeypaths.push( keypath ? keypath + '.' + key : key );
				}
			});
		}

		return matchingKeypaths;
	}
}

function concatenate ( key ) {
	return keypath => keypath ? keypath + '.' + key : key;
}

export function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

export function splitKeypath ( keypath ) {
	return normalise( keypath ).split( '.' );
}
