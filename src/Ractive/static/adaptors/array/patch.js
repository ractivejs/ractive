import runloop from 'global/runloop';
import { defineProperty } from 'utils/object';
import getNewIndices from 'shared/getNewIndices';
import processWrapper from './processWrapper';

const mutatorMethods = [ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ];
let patchedArrayProto = [];

mutatorMethods.forEach( function ( methodName ) {
	const method = function ( ...args ) {
		const newIndices = getNewIndices( this.length, methodName, args );

		// apply the underlying method
		const result = Array.prototype[ methodName ].apply( this, arguments );

		// trigger changes
		runloop.start();

		this._ractive.setting = true;
		let i = this._ractive.wrappers.length;
		while ( i-- ) {
			processWrapper( this._ractive.wrappers[i], this, methodName, newIndices );
		}

		runloop.end();

		this._ractive.setting = false;
		return result;
	};

	defineProperty( patchedArrayProto, methodName, {
		value: method
	});
});

let patchArrayMethods;
let unpatchArrayMethods;

// can we use prototype chain injection?
// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection
if ( ({}).__proto__ ) {
	// yes, we can
	patchArrayMethods = array => array.__proto__ = patchedArrayProto;
	unpatchArrayMethods = array => array.__proto__ = Array.prototype;
}

else {
	// no, we can't
	patchArrayMethods = array => {
		let i = mutatorMethods.length;
		while ( i-- ) {
			const methodName = mutatorMethods[i];
			defineProperty( array, methodName, {
				value: patchedArrayProto[ methodName ],
				configurable: true
			});
		}
	};

	unpatchArrayMethods = array => {
		let i = mutatorMethods.length;
		while ( i-- ) {
			delete array[ mutatorMethods[i] ];
		}
	};
}

patchArrayMethods.unpatch = unpatchArrayMethods; // TODO export separately?
export default patchArrayMethods;
