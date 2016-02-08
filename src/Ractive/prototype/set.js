import { isObject, isRactiveElement } from '../../utils/is';
import bind from '../../utils/bind';
import { splitKeypath } from '../../shared/keypaths';
import runloop from '../../global/runloop';
import resolveReference from '../../view/resolvers/resolveReference';

export default function Ractive$set ( keypath, value, context ) {
	const promise = runloop.start( this, true );

	// Set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		const map = keypath;

		for ( keypath in map ) {
			if ( map.hasOwnProperty( keypath ) ) {
				set( this, keypath, map[ keypath ], value );
			}
		}
	}
	// Set a single keypath
	else {
		set( this, keypath, value, context );
	}

	runloop.end();

	return promise;
}

function set ( ractive, keypath, value, context ) {
	if ( typeof value === 'function' ) value = bind( value, ractive );

	if ( /\*/.test( keypath ) ) {
		ractive.viewmodel.findMatches( splitKeypath( keypath ) ).forEach( model => {
			model.set( value );
		});
	} else {
		if ( isRactiveElement( context ) ) {
			resolveReference( context._ractive.fragment, keypath ).set( value );
		} else {
			ractive.viewmodel.joinAll( splitKeypath( keypath ) ).set( value );
		}
	}
}
