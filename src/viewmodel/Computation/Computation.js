import warn from 'utils/warn';
import isEqual from 'utils/isEqual';
import runloop from 'global/runloop';

var Computation = function ( ractive, key, signature ) {
	this.ractive = ractive;
	this.viewmodel = ractive.viewmodel;
	this.key = key;

	this.getter = signature.get;
	this.setter = signature.set;

	this.dependencies = [];
	this.update();
};

Computation.prototype = {
	set: function ( value ) {
		if ( this.setting ) {
			this.value = value;
			return;
		}

		if ( !this.setter ) {
			throw new Error( 'Computed properties without setters are read-only in the current version' );
		}

		this.setter.call( this.ractive, value );
	},

	// returns `false` if the computation errors
	compute: function () {
		var ractive, errored, newDependencies;

		ractive = this.ractive;
		ractive.viewmodel.capture();

		try {
			this.value = this.getter.call( ractive );
		} catch ( err ) {
			if ( ractive.debug ) {
				warn( 'Failed to compute "' + this.key + '": ' + err.message || err );
			}

			errored = true;
		}

		newDependencies = ractive.viewmodel.release();
		diff( this, this.dependencies, newDependencies );

		return errored ? false : true;
	},

	update: function () {
		var oldValue = this.value;

		if ( this.compute() && !isEqual( this.value, oldValue ) ) {
			this.ractive.viewmodel.mark( this.key );
		}
	}
};

function diff ( computation, dependencies, newDependencies ) {
	var i, keypath;

	// remove dependencies that are no longer used
	i = dependencies.length;
	while ( i-- ) {
		keypath = dependencies[i];

		if ( newDependencies.indexOf( keypath ) === -1 ) {
			computation.viewmodel.unregister( keypath, computation, 'computed' );
		}
	}

	// create references for any new dependencies
	i = newDependencies.length;
	while ( i-- ) {
		keypath = newDependencies[i];

		if ( dependencies.indexOf( keypath ) === -1 ) {
			computation.viewmodel.register( keypath, computation, 'computed' );
		}
	}

	computation.dependencies = newDependencies.slice();
}

export default Computation;
