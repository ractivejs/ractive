import runloop from '../global/runloop';
import { splitKeypath } from './keypaths';
import { isObject } from '../utils/is';
import bind from '../utils/bind';

export function set ( ractive, pairs ) {
	const promise = runloop.start( ractive, true );

	let i = pairs.length;
	while ( i-- ) {
		const model = pairs[i][0];
		let value = pairs[i][1];
		if ( typeof value === 'function' ) value = bind( value, ractive );
		model.set( value );
	}

	runloop.end();

	return promise;
}

const star = /\*/;
export function gather ( ractive, keypath, base = ractive.viewmodel ) {
	if ( star.test( keypath ) ) {
		return base.findMatches( splitKeypath( keypath ) );
	} else {
		return [ base.joinAll( splitKeypath( keypath ) ) ];
	}
}

export function build ( ractive, keypath, value ) {
	const sets = [];

	// set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		for ( const k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				sets.push.apply( sets, gather( ractive, k ).map( m => [ m, keypath[k] ] ) );
			}
		}

	}
	// set a single keypath
	else {
		sets.push.apply( sets, gather( ractive, keypath ).map( m => [ m, value ] ) );
	}

	return sets;
}
