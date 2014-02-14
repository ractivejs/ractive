define([
	'state/scheduler',
	'utils/defineProperty',
	'shared/clearCache',
	'shared/makeTransitionManager',
	'shared/get/arrayAdaptor/getSpliceEquivalent',
	'shared/get/arrayAdaptor/summariseSpliceOperation',
	'shared/get/arrayAdaptor/processWrapper'
], function (
	scheduler,
	defineProperty,
	clearCache,
	makeTransitionManager,
	getSpliceEquivalent,
	summariseSpliceOperation,
	processWrapper
) {

	'use strict';

	var patchedArrayProto = [],
		mutatorMethods = [ 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift' ],
		noop = function () {},
		testObj,
		patchArrayMethods,
		unpatchArrayMethods;

	mutatorMethods.forEach( function ( methodName ) {
		var method = function () {
			var spliceEquivalent,
				spliceSummary,
				result,
				instances,
				instance,
				i;

			scheduler.start( this );

			// push, pop, shift and unshift can all be represented as a splice operation.
			// this makes life easier later
			spliceEquivalent = getSpliceEquivalent( this, methodName, Array.prototype.slice.call( arguments ) );
			spliceSummary = summariseSpliceOperation( this, spliceEquivalent );

			// apply the underlying method
			result = Array.prototype[ methodName ].apply( this, arguments );

			// create transition managers
			instances = this._ractive.instances;
			i = instances.length;
			while ( i-- ) {
				instance = instances[i];
				instance._transitionManager = makeTransitionManager( instance, noop );
			}

			// trigger changes
			this._ractive.setting = true;
			i = this._ractive.wrappers.length;
			while ( i-- ) {
				processWrapper( this._ractive.wrappers[i], this, methodName, spliceSummary );
			}
			this._ractive.setting = false;

			// apply changes
			scheduler.end();

			// initialise transition managers
			i = instances.length;
			while ( i-- ) {
				instance = instances[i];
				instance._transitionManager.init();
			}

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

	return patchArrayMethods;

});
