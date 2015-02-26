import { isObject } from 'utils/is';
import { getMatchingKeypaths, normalise } from 'shared/keypaths';
import runloop from 'global/runloop';

var wildcard = /\*/;

export default function Ractive$set ( keypath, value ) {
	var map, promise, model;

	promise = runloop.start( this, true );

	// Set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		map = keypath;

		for ( keypath in map ) {
			if ( map.hasOwnProperty( keypath) ) {
				value = map[ keypath ];
				model = this.viewmodel.getKeypath( normalise( keypath ) );

				this.viewmodel.set( model, value );
			}
		}
	}

	// Set a single keypath
	else {
		model = this.viewmodel.getKeypath( normalise( keypath ) );

		// TODO a) wildcard test should probably happen at viewmodel level,
		// b) it should apply to multiple/single set operations
		if ( wildcard.test( model.getKeypath() ) ) {
			getMatchingKeypaths( this, model.getKeypath() ).forEach( model => {
				this.viewmodel.set( model, value );
			});
		} else {
			this.viewmodel.set( model, value );
		}
	}

	runloop.end();

	return promise;
}
