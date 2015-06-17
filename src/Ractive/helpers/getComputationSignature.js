import { fatal } from 'utils/log';

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

const pattern = /\$\{([^\}]+)\}/g;

export default function getComputationSignature ( ractive, key, signature ) {
	let getter;
	let setter;

	// useful for debugging
	let getterString;
	let getterUseStack;
	let setterString;

	if ( typeof signature === 'function' ) {
		getter = bind( signature, ractive );
		getterString = signature.toString();
		getterUseStack = true;
	}

	if ( typeof signature === 'string' ) {
		getter = createFunctionFromString( ractive, signature );
		getterString = signature;
	}

	if ( typeof signature === 'object' ) {
		if ( typeof signature.get === 'string' ) {
			getter = createFunctionFromString( ractive, signature.get );
			getterString = signature.get;
		} else if ( typeof signature.get === 'function' ) {
			getter = bind( signature.get, ractive );
			getterString = signature.get.toString();
			getterUseStack = true;
		} else {
			fatal( '`%s` computation must have a `get()` method', key );
		}

		if ( typeof signature.set === 'function' ) {
			setter = bind( signature.set, ractive );
			setterString = signature.set.toString();
		}
	}

	return {
		getter,
		setter,
		getterString,
		setterString,
		getterUseStack
	};
}
