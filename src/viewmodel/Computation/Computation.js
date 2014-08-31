import log from 'utils/log';
import isEqual from 'utils/isEqual';
import diff from 'viewmodel/Computation/diff';

var Computation = function ( ractive, key, signature ) {
	var initial;

	this.ractive = ractive;
	this.viewmodel = ractive.viewmodel;
	this.key = key;

	this.getter = signature.get;
	this.setter = signature.set;

	this.dependencies = [];

	if ( initial = ractive.viewmodel.get( key ) ) {
		this.set( initial );
	}

	this.update();
};

Computation.prototype = {
	get: function () {
		this.compute();
		return this.value;
	},

	set: function ( value ) {
		if ( this.setting ) {
			this.value = value;
			return;
		}

		if ( !this.setter ) {
			throw new Error( 'Computed properties without setters are read-only. (This may change in a future version of Ractive!)' );
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

			log.warn({
				debug: ractive.debug,
				message: 'failedComputation',
				args: {
					key: this.key,
					err: err.message || err
				}
			});

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

export default Computation;
