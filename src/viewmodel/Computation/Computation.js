import runloop from 'global/runloop';
import { log, warn } from 'utils/log';
import { isEqual } from 'utils/is';
import UnresolvedDependency from './UnresolvedDependency';

var Computation = function ( ractive, key, signature ) {
	this.ractive = ractive;
	this.viewmodel = ractive.viewmodel;
	this.key = key;

	this.getter = signature.get;
	this.setter = signature.set;

	this.hardDeps = signature.deps || [];
	this.softDeps = [];
	this.unresolvedDeps = {};

	this.depValues = {};

	if ( this.hardDeps ) {
		this.hardDeps.forEach( d => ractive.viewmodel.register( d, this, 'computed' ) );
	}

	this._dirty = this._firstRun = true;
};

Computation.prototype = {
	constructor: Computation,

	init: function () {
		var initial;

		this.bypass = true;

		initial = this.ractive.viewmodel.get( this.key );
		this.ractive.viewmodel.clearCache( this.key.str );

		this.bypass = false;

		if ( this.setter && initial !== undefined ) {
			this.set( initial );
		}
	},

	invalidate: function () {
		this._dirty = true;
	},

	get: function () {
		var ractive, newDeps, dependenciesChanged, dependencyValuesChanged = false;

		if ( this.getting ) {
			// prevent double-computation (e.g. caused by array mutation inside computation)
			return;
		}

		this.getting = true;

		if ( this._dirty ) {
			ractive = this.ractive;

			// determine whether the inputs have changed, in case this depends on
			// other computed values
			if ( this._firstRun || ( !this.hardDeps.length && !this.softDeps.length ) ) {
				dependencyValuesChanged = true;
			} else {
				[ this.hardDeps, this.softDeps ].forEach( deps => {
					var keypath, value, i;

					if ( dependencyValuesChanged ) {
						return;
					}

					i = deps.length;
					while ( i-- ) {
						keypath = deps[i];
						value = ractive.viewmodel.get( keypath );

						if ( !isEqual( value, this.depValues[ keypath.str ] ) ) {
							this.depValues[ keypath.str ] = value;
							dependencyValuesChanged = true;

							return;
						}
					}
				});
			}

			if ( dependencyValuesChanged ) {
				ractive.viewmodel.capture();

				try {
					this.value = this.getter.call( ractive );
				} catch ( err ) {
					if ( ractive.debug ) {
						warn( 'Failed to compute "%s"', this.key.str );
						log( err.stack || err );
					}

					this.value = void 0;
				}

				newDeps = ractive.viewmodel.release();
				dependenciesChanged = this.updateDependencies( newDeps );

				if ( dependenciesChanged ) {
					[ this.hardDeps, this.softDeps ].forEach( deps => {
						deps.forEach( keypath => {
							this.depValues[ keypath.str ] = ractive.viewmodel.get( keypath );
						});
					});
				}
			}

			this._dirty = false;
		}

		this.getting = this._firstRun = false;
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
		var i, oldDeps, keypath, dependenciesChanged, unresolved;

		oldDeps = this.softDeps;

		// remove dependencies that are no longer used
		i = oldDeps.length;
		while ( i-- ) {
			keypath = oldDeps[i];

			if ( newDeps.indexOf( keypath ) === -1 ) {
				dependenciesChanged = true;
				this.viewmodel.unregister( keypath, this, 'computed' );
			}
		}

		// create references for any new dependencies
		i = newDeps.length;
		while ( i-- ) {
			keypath = newDeps[i];

			if ( oldDeps.indexOf( keypath ) === -1 && ( !this.hardDeps || this.hardDeps.indexOf( keypath ) === -1 ) ) {
				dependenciesChanged = true;

				// if this keypath is currently unresolved, we need to mark
				// it as such. TODO this is a bit muddy...
				if ( isUnresolved( this.viewmodel, keypath ) && ( !this.unresolvedDeps[ keypath.str ] ) ) {
					unresolved = new UnresolvedDependency( this, keypath.str );
					newDeps.splice( i, 1 );

					this.unresolvedDeps[ keypath.str ] = unresolved;
					runloop.addUnresolved( unresolved );
				} else {
					this.viewmodel.register( keypath, this, 'computed' );
				}
			}
		}

		if ( dependenciesChanged ) {
			this.softDeps = newDeps.slice();
		}

		return dependenciesChanged;
	}
};

function isUnresolved( viewmodel, keypath ) {
	var key = keypath.firstKey;

	return !( key in viewmodel.ractive.data ) &&
	       !( key in viewmodel.computations ) &&
	       !( key in viewmodel.mappings );
}

export default Computation;
