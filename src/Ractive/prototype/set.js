import runloop from 'global/runloop';
import isObject from 'utils/isObject';
import normaliseKeypath from 'utils/normaliseKeypath';
import Promise from 'utils/Promise';
import getMatchingKeypaths from 'shared/getMatchingKeypaths';

var wildcard = /\*/;

export default function Ractive$set ( keypath, value, callback ) {
	var map,
		promise,
		fulfilPromise;

	promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
	runloop.start( this, fulfilPromise );

	// Set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		map = keypath;
		callback = value;

		for ( keypath in map ) {
			if ( map.hasOwnProperty( keypath) ) {
				value = map[ keypath ];
				keypath = normaliseKeypath( keypath );

				this.viewmodel.set( keypath, value );
			}
		}
	}

	// Set a single keypath
	else {
		keypath = normaliseKeypath( keypath );

		if ( wildcard.test( keypath ) ) {
			getMatchingKeypaths( this, keypath ).forEach( keypath => {
				this.viewmodel.set( keypath, value );
			});
		} else {
			this.viewmodel.set( keypath, value );
		}
	}

	runloop.end();

	if ( callback ) {
		promise.then( callback.bind( this ) );
	}

	return promise;
}
