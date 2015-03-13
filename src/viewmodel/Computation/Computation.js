import { log, warn } from 'utils/log';
import { isEqual } from 'utils/is';

class Computation {

	constructor ( viewmodel, signature, initialValue ) {

		this.viewmodel = viewmodel;

		this.getter = signature.getter;
		this.setter = signature.setter;

		this.hardDeps = signature.deps || [];
		this.softDeps = [];

		this.depValues = {};

		this._dirty = this._firstRun = true;

		if ( this.setter && initialValue !== undefined ) {
			this.set( initialValue );
		}
	}

	// TODO: TEMP workaround for dependecy issue
	setModel ( model ) {
		this.model = model;
		if ( this.hardDeps ) {
			this.hardDeps.forEach( d => d.register( model, 'computed' ) );
		}
	}

	invalidate () {
		this._dirty = true;
	}

	get () {
		var model, newDeps, dependenciesChanged, dependencyValuesChanged = false;

		if ( this.getting ) {
			// prevent double-computation (e.g. caused by array mutation inside computation)
			return;
		}

		this.getting = true;

		if ( this._dirty ) {
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
						model = deps[i];
						keypath = model.getKeypath();
						value = model.get();

						if ( !isEqual( value, this.depValues[ keypath ] ) ) {
							this.depValues[ keypath ] = value;
							dependencyValuesChanged = true;
							return;
						}
					}
				});
			}

			if ( dependencyValuesChanged ) {
				this.viewmodel.capture();

				try {
					this.value = this.getter();
				} catch ( err ) {
					if ( this.viewmodel.debug ) {
						warn( 'Failed to compute "%s"', this.key.getKeypath() );
						log( err.stack || err );
					}

					this.value = void 0;
				}

				newDeps = this.viewmodel.release();
				dependenciesChanged = this.updateDependencies( newDeps );

				if ( dependenciesChanged ) {
					this.depValues = {};
					[ this.hardDeps, this.softDeps ].forEach( deps => {
						deps.forEach( model => {
							this.depValues[ model.getKeypath() ] = this.viewmodel.get( model );
						});
					});
				}
			}

			this._dirty = false;
		}

		this.getting = this._firstRun = false;
		return this.value;
	}

	set ( value ) {
		if ( this.setting ) {
			this.value = value;
			return;
		}

		if ( !this.setter ) {
			throw new Error( 'Computed properties without setters are read-only. (This may change in a future version of Ractive!)' );
		}

		this.setter( value );
	}

	updateDependencies ( newDeps ) {
		var i, oldDeps, model, dependenciesChanged, unresolved;

		oldDeps = this.softDeps;

		// remove dependencies that are no longer used
		i = oldDeps.length;
		while ( i-- ) {
			model = oldDeps[i];

			if ( newDeps.indexOf( model ) === -1 ) {
				dependenciesChanged = true;
				model.unregister( this, 'computed' );
			}
		}

		// create references for any new dependencies
		i = newDeps.length;
		while ( i-- ) {
			model = newDeps[i];

			if ( oldDeps.indexOf( model ) === -1 && ( !this.hardDeps || this.hardDeps.indexOf( model ) === -1 ) ) {
				dependenciesChanged = true;

				model.register( this.model, 'computed' );
			}
		}

		if ( dependenciesChanged ) {
			this.softDeps = newDeps.slice();
		}

		return dependenciesChanged;
	}
}

export default Computation;
