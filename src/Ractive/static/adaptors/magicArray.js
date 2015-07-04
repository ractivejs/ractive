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

		// ugh, this really is a terrible hack
		Object.defineProperty( this, '__model', {
			get () {
				return this.arrayWrapper.__model;
			},
			set ( model ) {
				this.arrayWrapper.__model = model;
			}
		});
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
