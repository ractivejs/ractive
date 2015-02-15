import { isObject } from 'utils/is';
import { getMatchingKeypaths, getKeypath, normalise } from 'shared/keypaths';
import runloop from 'global/runloop';

var wildcard = /\*/;

export default function Ractive$set ( keypath, value ) {
	var map, promise;

	promise = runloop.start( this, true );

	// Set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		map = keypath;

		for ( keypath in map ) {
			if ( map.hasOwnProperty( keypath) ) {
				value = map[ keypath ];
				keypath = getKeypath( normalise( keypath ) );

				this.viewmodel.set( keypath, value );
			}
		}
	}

	// Set a single keypath
	else {
		keypath = getKeypath( normalise( keypath ) );

		// TODO a) wildcard test should probably happen at viewmodel level,
		// b) it should apply to multiple/single set operations
		if ( wildcard.test( keypath.str ) ) {
			getMatchingKeypaths( this, keypath.str ).forEach( keypath => {
				this.viewmodel.set( keypath, value );
			});
		} else {
			this.viewmodel.set( keypath, value );
		}
	}

	runloop.end();

	return promise;
}
