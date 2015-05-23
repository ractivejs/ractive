import { isObject } from 'utils/is';
import getObserverFacade from './getObserverFacade';

export default function dispatchObserve ( ractive, keypath, callback, options ) {


	// `ractive.observe( { foo: n => {}, bar: n => {} } [, options] )`
	if ( isObject( keypath ) ) {
		return observeHashMap( ractive, keypath, callback, options );
	}

	// `ractive.observe( callback [, options] )`
	// ( i.e. observe entire model )
	if ( typeof keypath === 'function' ) {
		return getObserverFacade( ractive, '', /*callback*/ keypath, /*options*/ callback );
	}

	const keypaths = keypath.split( ' ' );

	// `ractive.observe( 'foo', n => {} [, options] )`
	if ( keypaths.length === 1 ) {
		return getObserverFacade( ractive, keypath, callback, options );
	}

	// `ractive.observe( 'foo bar qux', n => {} [, options] )`
	return observeMultipleKeypaths( ractive, keypaths, callback, options );

}

function observeHashMap ( ractive, map, callback, options ) {

	const keys = Object.keys( map ),
		  observers = new Array( keys.length );

	var i = keys.length, key;

	while ( i-- ) {
		key = keys[i];
		observers[i] = dispatchObserve( ractive, key, map[ key ], options );
	}

	return getArrayCancel( observers );
}

function observeMultipleKeypaths ( ractive, keypaths, callback, options ) {
	const observers = new Array( keypaths.length );

	var i = keypaths.length, keypath;

	while ( i-- ) {
		keypath = keypaths[i];

		if ( keypath ) {
			observers[i] = getObserverFacade( ractive, keypath, callback, options );
		}
	}

	return getArrayCancel( observers );
}

function getArrayCancel ( observers ) {
	return {
		cancel: function () {
			const length = observers.length;
			for ( var i = 0; i < length; i++ ) {
				observers[i].cancel();
			}
		}
	};
}
