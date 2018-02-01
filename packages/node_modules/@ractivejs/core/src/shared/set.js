import runloop from '../global/runloop';
import { splitKeypath } from './keypaths';
import { isObject } from '../utils/is';
import { warnIfDebug } from '../utils/log';
import resolveReference from '../view/resolvers/resolveReference';
import { FakeFragment } from './getRactiveContext';

export let keep = false;

export function set ( ractive, pairs, options ) {
	const k = keep;

	const deep = options && options.deep;
	const shuffle = options && options.shuffle;
	const promise = runloop.start( ractive, true );
	if ( options && 'keep' in options ) keep = options.keep;

	let i = pairs.length;
	while ( i-- ) {
		const model = pairs[i][0];
		const value = pairs[i][1];
		const keypath = pairs[i][2];

		if ( !model ) {
			runloop.end();
			throw new Error( `Failed to set invalid keypath '${ keypath }'` );
		}

		if ( deep ) deepSet( model, value );
		else if ( shuffle ) {
			let array = value;
			const target = model.get();
			// shuffle target array with itself
			if ( !array ) array = target;

			// if there's not an array there yet, go ahead and set
			if ( target === undefined ) {
				model.set( array );
			} else {
				if ( !Array.isArray( target ) || !Array.isArray( array ) ) {
					runloop.end();
					throw new Error( 'You cannot merge an array with a non-array' );
				}

				const comparator = getComparator( shuffle );
				model.merge( array, comparator );
			}
		} else model.set( value );
	}

	runloop.end();

	keep = k;

	return promise;
}

const star = /\*/;
export function gather ( ractive, keypath, base, isolated ) {
	if ( !base && ( keypath[0] === '.' || keypath[1] === '^' ) ) {
		warnIfDebug( `Attempted to set a relative keypath from a non-relative context. You can use a context object to set relative keypaths.` );
		return [];
	}

	const keys = splitKeypath( keypath );
	const model = base || ractive.viewmodel;

	if ( star.test( keypath ) ) {
		return model.findMatches( keys );
	} else {
		if ( model === ractive.viewmodel ) {
			// allow implicit mappings
			if ( ractive.component && !ractive.isolated && !model.has( keys[0] ) && keypath[0] !== '@' && keypath[0] && !isolated ) {
				return [ resolveReference( ractive.fragment || new FakeFragment( ractive ), keypath ) ];
			} else {
				return [ model.joinAll( keys ) ];
			}
		} else {
			return [ model.joinAll( keys ) ];
		}
	}
}

export function build ( ractive, keypath, value, isolated ) {
	const sets = [];

	// set multiple keypaths in one go
	if ( isObject( keypath ) ) {
		for ( const k in keypath ) {
			if ( keypath.hasOwnProperty( k ) ) {
				sets.push.apply( sets, gather( ractive, k, null, isolated ).map( m => [ m, keypath[k], k ] ) );
			}
		}

	}
	// set a single keypath
	else {
		sets.push.apply( sets, gather( ractive, keypath, null, isolated ).map( m => [ m, value, keypath ] ) );
	}

	return sets;
}

const deepOpts = { virtual: false };
function deepSet( model, value ) {
	const dest = model.get( false, deepOpts );

	// if dest doesn't exist, just set it
	if ( dest == null || typeof value !== 'object' ) return model.set( value );
	if ( typeof dest !== 'object' ) return model.set( value );

	for ( const k in value ) {
		if ( value.hasOwnProperty( k ) ) {
			deepSet( model.joinKey( k ), value[k] );
		}
	}
}

const comparators = {};
function getComparator ( option ) {
	if ( option === true ) return null; // use existing arrays
	if ( typeof option === 'function' ) return option;

	if ( typeof option === 'string' ) {
		return comparators[ option ] || ( comparators[ option ] = thing => thing[ option ] );
	}

	throw new Error( 'If supplied, options.compare must be a string, function, or true' ); // TODO link to docs
}
