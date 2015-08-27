import { isObject } from 'utils/is';
import { splitKeypath } from 'shared/keypaths';
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
	if ( /\*/.test( keypath ) ) {
		ractive.viewmodel.findMatches( splitKeypath( keypath ) ).forEach( model => {
			model.set( value );
		});
	} else {
		const model = ractive.viewmodel.joinAll( splitKeypath( keypath ) );
		model.set( value );
	}
}
