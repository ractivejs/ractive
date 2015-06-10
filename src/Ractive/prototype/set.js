import { isObject } from 'utils/is';
import { getMatchingKeypaths, normalise } from 'shared/keypaths';
import runloop from 'global/runloop';

export default function Ractive$set ( keypath, value ) {
	var map, promise;

	promise = runloop.start( this, true );

	// Set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		map = keypath;

		for ( keypath in map ) {
			if ( map.hasOwnProperty( keypath) ) {
				set( this, keypath, map[ keypath ] );
			}
		}
	}
	// Set a single keypath
	else {
		set( this, keypath, value );
	}

	runloop.end();

	return promise;
}


function set ( ractive, keypath, value ) {
	ractive.viewmodel.join( normalise( keypath ).split( '.' ) ).set( value );
}

//TODO: wildcards

// function set ( ractive, keypath, value ) {
// 	keypath = getKeypath( normalise( keypath ) );

// 	if ( keypath.isPattern ) {
// 		getMatchingKeypaths( ractive, keypath ).forEach( keypath => {
// 			ractive.viewmodel.set( keypath, value );
// 		});
// 	} else {
// 		ractive.viewmodel.set( keypath, value );
// 	}
// }
