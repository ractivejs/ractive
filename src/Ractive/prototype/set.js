import { isObject } from '../../utils/is';
import bind from '../../utils/bind';
import { splitKeypath } from '../../shared/keypaths';
import runloop from '../../global/runloop';

export default function Ractive$set ( keypath, value ) {
	const promise = runloop.start( this, true );

	// Set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		const map = keypath;

		for ( const k in map ) {
			if ( map.hasOwnProperty( k) ) {
				set( this, k, map[k] );
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
	if ( typeof value === 'function' ) value = bind( value, ractive );

	if ( /\*/.test( keypath ) ) {
		ractive.viewmodel.findMatches( splitKeypath( keypath ) ).forEach( model => {
			model.set( value );
		});
	} else {
		const model = ractive.viewmodel.joinAll( splitKeypath( keypath ) );
		model.set( value );
	}
}
