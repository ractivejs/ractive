import runloop from 'global/runloop';
import { defineProperty } from 'utils/object';
import getNewIndices from 'shared/getNewIndices';
import processWrapper from './processWrapper';

var patchedArrayProto = [],
	mutatorMethods = [ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ],
	testObj,
	patchArrayMethods,
	unpatchArrayMethods;

mutatorMethods.forEach( function ( methodName ) {
	var method = function ( ...args ) {
		var newIndices,
			result,
			wrapper,
			i;

		newIndices = getNewIndices( this, methodName, args );

		// apply the underlying method
		result = Array.prototype[ methodName ].apply( this, arguments );

		// trigger changes
		runloop.start();

		// set _ractive.setting to given value on all arrays inside obj
		var setSetting = function(obj, value, parents){
			parents = parents || [];

			// check if we have an object
			if( !obj || typeof obj !== "object" ){
			    return;
			}

			// check if object have _ractive property
			if(typeof obj._ractive !== 'undefined') {
				obj._ractive.setting = value;
			}

			// detect and break circular references
			for (var i = parents.length - 1; i >= 0; i--) {
				if(parents[i] === obj) {
					return;
				}
			};

			// save visted obj
			parents.push(obj); 

			// recurse
			for(var prop in obj ) {
				if( obj.hasOwnProperty( prop ) ) {
					setSetting(obj[ prop ], value);
				}
			}
		}

		setSetting(this, true);

		i = this._ractive.wrappers.length;
		while ( i-- ) {
			wrapper = this._ractive.wrappers[i];

			runloop.addRactive( wrapper.root );
			processWrapper( wrapper, this, methodName, newIndices );
		}

		runloop.end();

		setSetting(this, false);

		return result;
	};

	defineProperty( patchedArrayProto, methodName, {
		value: method
	});
});

// can we use prototype chain injection?
// http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection
testObj = {};

if ( testObj.__proto__ ) {
	// yes, we can
	patchArrayMethods = function ( array ) {
		array.__proto__ = patchedArrayProto;
	};

	unpatchArrayMethods = function ( array ) {
		array.__proto__ = Array.prototype;
	};
}

else {
	// no, we can't
	patchArrayMethods = function ( array ) {
		var i, methodName;

		i = mutatorMethods.length;
		while ( i-- ) {
			methodName = mutatorMethods[i];
			defineProperty( array, methodName, {
				value: patchedArrayProto[ methodName ],
				configurable: true
			});
		}
	};

	unpatchArrayMethods = function ( array ) {
		var i;

		i = mutatorMethods.length;
		while ( i-- ) {
			delete array[ mutatorMethods[i] ];
		}
	};
}

patchArrayMethods.unpatch = unpatchArrayMethods;
export default patchArrayMethods;
