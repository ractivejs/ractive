define([
	'utils/defineProperty',
	'utils/isArray',
	'shared/get/arrayAdaptor/patch'
], function (
	defineProperty,
	isArray,
	patch
) {

	'use strict';

	var arrayAdaptor,

		// helpers
		ArrayWrapper,
		errorMessage;


	arrayAdaptor = {
		filter: function ( object ) {
			// wrap the array if a) b) it's an array, and b) either it hasn't been wrapped already,
			// or the array didn't trigger the get() itself
			return isArray( object ) && ( !object._ractive || !object._ractive.setting );
		},
		wrap: function ( ractive, array, keypath ) {
			return new ArrayWrapper( ractive, array, keypath );
		}
	};

	ArrayWrapper = function ( ractive, array, keypath ) {
		this.root = ractive;
		this.value = array;
		this.keypath = keypath;

		// if this array hasn't already been ractified, ractify it
		if ( !array._ractive ) {

			// define a non-enumerable _ractive property to store the wrappers
			defineProperty( array, '_ractive', {
				value: {
					wrappers: [],
					instances: [],
					setting: false
				},
				configurable: true
			});

			patch( array );
		}

		// store the ractive instance, so we can handle transitions later
		if ( !array._ractive.instances[ ractive._guid ] ) {
			array._ractive.instances[ ractive._guid ] = 0;
			array._ractive.instances.push( ractive );
		}

		array._ractive.instances[ ractive._guid ] += 1;
		array._ractive.wrappers.push( this );
	};

	ArrayWrapper.prototype = {
		get: function () {
			return this.value;
		},
		teardown: function () {
			var array, storage, wrappers, instances, index;

			array = this.value;
			storage = array._ractive;
			wrappers = storage.wrappers;
			instances = storage.instances;

			// if teardown() was invoked because we're clearing the cache as a result of
			// a change that the array itself triggered, we can save ourselves the teardown
			// and immediate setup
			if ( storage.setting ) {
				return false; // so that we don't remove it from this.root._wrapped
			}

			index = wrappers.indexOf( this );
			if ( index === -1 ) {
				throw new Error( errorMessage );
			}

			wrappers.splice( index, 1 );

			// if nothing else depends on this array, we can revert it to its
			// natural state
			if ( !wrappers.length ) {
				delete array._ractive;
				patch.unpatch( this.value );
			}

			else {
				// remove ractive instance if possible
				instances[ this.root._guid ] -= 1;
				if ( !instances[ this.root._guid ] ) {
					index = instances.indexOf( this.root );

					if ( index === -1 ) {
						throw new Error( errorMessage );
					}

					instances.splice( index, 1 );
				}
			}
		}
	};

	errorMessage = 'Something went wrong in a rather interesting way';

	return arrayAdaptor;

});
