import log from 'utils/log';

var Computation = function ( ractive, key, signature ) {
	this.ractive = ractive;
	this.viewmodel = ractive.viewmodel;
	this.key = key;

	this.getter = signature.get;
	this.setter = signature.set;

	this.hardDeps = signature.deps;
	this.softDeps = [];

	if ( this.hardDeps ) {
		this.hardDeps.forEach( d => ractive.viewmodel.register( d, this, 'computed' ) );
	}

	this._dirty = true;
};

Computation.prototype = {
	constructor: Computation,

	init: function () {
		var initial;

		this.bypass = true;

		initial = this.ractive.viewmodel.get( this.key );
		this.ractive.viewmodel.clearCache( this.key );

		this.bypass = false;

		if ( this.setter && initial !== undefined ) {
			this.set( initial );
		}
	},

	invalidate: function () {
		this._dirty = true;
	},

	get: function () {
		var ractive, newDeps, args;

		if ( this.getting ) {
			// prevent double-computation (e.g. caused by array mutation inside computation)
			return;
		}

		this.getting = true;

		if ( this._dirty ) {
			ractive = this.ractive;
			ractive.viewmodel.capture();

			try {
				if ( this.hardDeps ) {
					args = this.hardDeps.map( keypath => this.viewmodel.get( keypath ) );
					this.value = this.getter.apply( ractive, args );
				} else {
					this.value = this.getter.call( ractive );
				}
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

			newDeps = ractive.viewmodel.release();
			this.updateDependencies( newDeps );

			this._dirty = false;
		}

		this.getting = false;
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

	updateDependencies: function ( newDeps ) {
		var i, oldDeps, keypath;

		oldDeps = this.softDeps;

		// remove dependencies that are no longer used
		i = oldDeps.length;
		while ( i-- ) {
			keypath = oldDeps[i];

			if ( newDeps.indexOf( keypath ) === -1 ) {
				this.viewmodel.unregister( keypath, this, 'computed' );
			}
		}

		// create references for any new dependencies
		i = newDeps.length;
		while ( i-- ) {
			keypath = newDeps[i];

			if ( oldDeps.indexOf( keypath ) === -1 && ( !this.hardDeps || this.hardDeps.indexOf( keypath ) === -1 ) ) {
				this.viewmodel.register( keypath, this, 'computed' );
			}
		}

		this.softDeps = newDeps.slice();
	}
};

export default Computation;
