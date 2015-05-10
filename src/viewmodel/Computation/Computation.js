import { logIfDebug, warnIfDebug, warnOnce } from 'utils/log';
import { isEqual } from 'utils/is';

class Computation {

	constructor ( viewmodel, signature, initialValue ) {

		this.viewmodel = viewmodel;

		this.context = null;

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
	setContext ( context ) {
		this.context = context;
		if ( this.hardDeps ) {
			this.hardDeps.forEach( d => d.registerComputed( context ) );
		}
	}

	invalidate () {
		this._dirty = true;
	}

	get () {
		var context, newDeps, dependenciesChanged, dependencyValuesChanged = false;

		if ( this.getting ) {
			// prevent double-computation (e.g. caused by array mutation inside computation)
			let msg = `The ${this.key.str} computation indirectly called itself. This probably indicates a bug in the computation. It is commonly caused by \`array.sort(...)\` - if that\'s the case, clone the array first with \`array.slice().sort(...)\``;
			warnOnce( msg );
			return this.value;
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
						context = deps[i];
						keypath = context.getKeypath();
						value = context.get();

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
					warnIfDebug( 'Failed to compute "%s"', this.context.getKeypath() );
					logIfDebug( err.stack || err );
					this.value = void 0;
				}

				newDeps = this.viewmodel.release();
				dependenciesChanged = this.updateDependencies( newDeps );

				if ( dependenciesChanged ) {
					this.depValues = {};
					[ this.hardDeps, this.softDeps ].forEach( deps => {
						deps.forEach( context => {
							this.depValues[ context.getKeypath() ] = context.get();
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
		var i, oldDeps, dep, dependenciesChanged, unresolved;

		oldDeps = this.softDeps;

		// remove dependencies that are no longer used
		i = oldDeps.length;
		while ( i-- ) {
			dep = oldDeps[i];

			if ( newDeps.indexOf( dep ) === -1 ) {
				dependenciesChanged = true;
				dep.unregisterComputed( this.context );
			}
		}

		// create references for any new dependencies
		i = newDeps.length;
		while ( i-- ) {
			dep = newDeps[i];

			if ( oldDeps.indexOf( dep ) === -1 && ( !this.hardDeps || this.hardDeps.indexOf( dep ) === -1 ) ) {
				dependenciesChanged = true;

				dep.registerComputed( this.context );
			}
		}

		if ( dependenciesChanged ) {
			this.softDeps = newDeps.slice();
		}

		return dependenciesChanged;
	}
}

export default Computation;
