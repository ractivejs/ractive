import { isObject } from '../../utils/is';
import bind from '../../utils/bind';
import { splitKeypath } from '../../shared/keypaths';
import runloop from '../../global/runloop';

export default function Ractive$set ( keypath, value ) {
	const promise = runloop.start( this, true );

	// Set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		const map = keypath;

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
	const keys = splitKeypath( keypath );
	const model = ractive.viewmodel;

	if ( typeof value === 'function' ) value = bind( value, ractive );

	if ( /\*/.test( keypath ) ) {
		model.findMatches( keys ).forEach( model => {
			model.set( value );
		});
	} else {
		// prefer component alternate context to data
		if ( ractive.component && !model.has( keys[0] ) && model.has( 'this' ) ) {
			keys.unshift( 'this' );
			ractive.viewmodel.joinAll( keys ).set( value );
		} else {
			ractive.viewmodel.joinAll( keys ).set( value );
		}
	}
}
