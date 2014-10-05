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

	this._dirty = true;
};

Computation.prototype = {

	constructor: Computation,

	init: function () {
		var initial;

		this.bypass = true;

		initial = this.ractive.viewmodel.get( this.key );
		this.ractive.viewmodel.mark( this.key ); // re-clear the cache

		this.bypass = false;

		if ( this.setter && initial !== undefined ) {
			this.set( initial );
		}
	},

	invalidate: function () {
		this._dirty = true;
	},

	get: function () {
		var ractive, newDependencies;

		if ( this._dirty ) {
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

				this.value = void 0;
			}

			newDependencies = ractive.viewmodel.release();
			diff( this, this.dependencies, newDependencies );

			this._dirty = false;
		}

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
	}
};

export default Computation;
