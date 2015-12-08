import { fatal } from '../../utils/log';
import bind from '../../utils/bind';
import { createFunctionFromString } from '../config/runtime-parser';

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
		getter = createFunctionFromString( signature, ractive );
		getterString = signature;
	}

	if ( typeof signature === 'object' ) {
		if ( typeof signature.get === 'string' ) {
			getter = createFunctionFromString( signature.get, ractive );
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
