import { isObject } from 'utils/is';
import { getMatchingKeypaths } from 'shared/keypaths';
import log from 'utils/log/log';
import { getKeypath, normalise } from 'shared/keypaths';
import runloop from 'global/runloop';

var wildcard = /\*/;

export default function Ractive$set ( keypath, value, callback ) {
	var map, promise;

	promise = runloop.start( this, true );

	// Set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		map = keypath;
		callback = value;

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

	if ( callback ) {

		log.warn({
			debug: this.debug,
			message: 'usePromise',
			args: {
				method: 'ractive.set'
			}
		});

		promise
			.then( callback.bind( this ) )
			.then( null, err => {
				log.consoleError({
					debug: this.debug,
					err: err
				});
			});
	}

	return promise;
}
