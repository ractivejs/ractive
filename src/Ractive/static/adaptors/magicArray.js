import magicAdaptor from './magic';
import arrayAdaptor from './array/index';

class MagicArrayWrapper {
	constructor ( ractive, array, keypath ) {
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
	}

	get () {
		return this.value;
	}

	teardown () {
		this.arrayWrapper.teardown();
		this.magicWrapper.teardown();
	}

	reset ( value ) {
		return this.arrayWrapper.reset( value ) && this.magicWrapper.reset( value );
	}
}

export default {
	filter ( object, keypath, ractive ) {
		return magicAdaptor.filter( object, keypath, ractive ) && arrayAdaptor.filter( object );
	},

	wrap ( ractive, array, keypath ) {
		return new MagicArrayWrapper( ractive, array, keypath );
	}
};
