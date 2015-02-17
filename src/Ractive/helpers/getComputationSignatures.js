import { fatal } from 'utils/log';

var pattern = /\$\{([^\}]+)\}/g;

export default function getComputationSignatures ( ractive, computed ) {
	var signatures = {}, key;

	for ( key in computed ) {
		signatures[ key ] = getComputationSignature( ractive, key, computed[ key ] );
	}

	return signatures;
}

function getComputationSignature ( ractive, key, signature ) {
	var getter, setter;

	if ( typeof signature === 'function' ) {
		getter = bind( signature, ractive );
	}

	if ( typeof signature === 'string' ) {
		getter = createFunctionFromString( ractive, signature );
	}

	if ( typeof signature === 'object' ) {
		if ( typeof signature.get === 'string' ) {
			getter = createFunctionFromString( ractive, signature.get );
		} else if ( typeof signature.get === 'function' ) {
			getter = bind( signature.get, ractive );
		} else {
			fatal( '`%s` computation must have a `get()` method', key );
		}

		if ( typeof signature.set === 'function' ) {
			setter = bind( signature.set, ractive );
		}
	}

	return { getter: getter, setter: setter };
}

function createFunctionFromString ( ractive, str ) {
	var functionBody, hasThis, fn;

	functionBody = 'return (' + str.replace( pattern, ( match, keypath ) => {
		hasThis = true;
		return '__ractive.get("' + keypath + '")';
	}) + ');';

	if ( hasThis ) {
		functionBody = 'var __ractive = this; ' + functionBody;
	}

	fn = new Function( functionBody );
	return hasThis ? fn.bind( ractive ) : fn;
}

function bind ( fn, context ) {
	return /this/.test( fn.toString() ) ? fn.bind( context ) : fn;
}