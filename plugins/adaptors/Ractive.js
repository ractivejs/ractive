(function () {

	var RactiveWrapper;

	Ractive.adaptors.Ractive = {
		filter: function ( object ) {
			return object instanceof Ractive;
		},
		wrap: function ( ractive, otherRactive, keypath, prefixer ) {
			return new RactiveWrapper( ractive, otherRactive, keypath, prefixer );
		}
	};

	RactiveWrapper = function ( ractive, otherRactive, keypath, prefixer ) {
		var wrapper = this;

		this.value = otherRactive;

		this.changeHandler = otherRactive.on( 'change', function ( changeHash ) {
			wrapper.shortCircuit = true;
			ractive.set( prefixer( changeHash ) );
			wrapper.shortCircuit = false;
		});

		this.resetHandler = otherRactive.on( 'reset', function ( newData ) {
			wrapper.shortCircuit = true;
			ractive.update( keypath );
			wrapper.shortCircuit = false;
		});
	};

	RactiveWrapper.prototype = {
		teardown: function () {
			this.changeHandler.cancel();
			this.resetHandler.cancel();
		},
		get: function () {
			return this.value.get();
		},
		set: function ( keypath, value ) {
			this.value.set( keypath, value );
		},
		reset: function ( object ) {
			// If the new object is a Backbone model, assume this one is
			// being retired. Ditto if it's not a model at all
			if ( object instanceof Ractive || typeof object !== 'object' ) {
				return false;
			}

			// Otherwise if this is a POJO, reset the model
			this.value.reset( object );
		}
	};

}());