import runloop from '../global/runloop';
import { splitKeypath } from './keypaths';
import { isObject } from '../utils/is';
import bind from '../utils/bind';
import { warnIfDebug } from '../utils/log';

export function set ( ractive, pairs ) {
	const promise = runloop.start( ractive, true );

	let i = pairs.length;
	while ( i-- ) {
		const model = pairs[i][0];
		let value = pairs[i][1];
		const keypath = pairs[i][2];

		if ( !model ) {
			runloop.end();
			throw new Error( `Failed to set invalid keypath '${ keypath }'` );
		}

		if ( typeof value === 'function' ) value = bind( value, ractive );

		model.set( value );
	}

	runloop.end();

	return promise;
}

const star = /\*/;
export function gather ( ractive, keypath, base ) {
	if ( !base && keypath[0] === '.' ) {
		warnIfDebug( `Attempted to set a relative keypath from a non-relative context. You can use a getNodeInfo or event object to set relative keypaths.` );
		return [];
	}

	const model = base || ractive.viewmodel;
	if ( star.test( keypath ) ) {
		return model.findMatches( splitKeypath( keypath ) );
	} else {
		return [ model.joinAll( splitKeypath( keypath ) ) ];
	}
}

export function build ( ractive, keypath, value ) {
	const sets = [];

	// set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		for ( const k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				sets.push.apply( sets, gather( ractive, k ).map( m => [ m, keypath[k], k ] ) );
			}
		}

	}
	// set a single keypath
	else {
		sets.push.apply( sets, gather( ractive, keypath ).map( m => [ m, value, keypath ] ) );
	}

	return sets;
}
