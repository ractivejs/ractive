import magicAdaptor from './magic';
import arrayAdaptor from './array/index';

var magicArrayAdaptor, MagicArrayWrapper;

if ( magicAdaptor ) {
	magicArrayAdaptor = {
		filter: function ( object, keypath, ractive ) {
			return magicAdaptor.filter( object, keypath, ractive ) && arrayAdaptor.filter( object );
		},

		wrap: function ( ractive, array, keypath ) {
			return new MagicArrayWrapper( ractive, array, keypath );
		}
	};

	MagicArrayWrapper = function ( ractive, array, keypath ) {
		this.value = array;

		this.magic = true;

		this.magicWrapper = magicAdaptor.wrap( ractive, array, keypath );
		this.arrayWrapper = arrayAdaptor.wrap( ractive, array, keypath );
	};

	MagicArrayWrapper.prototype = {
		get: function () {
			return this.value;
		},
		teardown: function () {
			this.arrayWrapper.teardown();
			this.magicWrapper.teardown();
		},
		reset: function ( value ) {
			return this.magicWrapper.reset( value );
		}
	};
}

export default magicArrayAdaptor;
