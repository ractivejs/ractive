import { logIfDebug, warnIfDebug, warnOnce } from 'utils/log';
import { isEqual } from 'utils/is';

class ComputedStore {

	constructor ( signature, context ) {

		this.context = context;

		this.getter = signature.getter;
		this.setter = signature.setter;

		const hardDeps = this.hardDeps = signature.deps || [];
		this.softDeps = [];
		this.depValues = {};

		this._dirty = this._firstRun = true;

		if ( hardDeps && hardDeps.length ) {
			this.hardDeps.forEach( d => d.registerComputed( context ) );
		}
	}

	invalidate () {
		this._dirty = true;
	}

	getSettable ( propertyOrIndex ) {
		var value = this.get();

		if ( !value ) {
			// What to do here? And will we even be here?
			throw new Error(`Setting a child of non-existant parent computation or expression ${this.context.getKeypath()}`);
		}

		return value;
	}

	get () {
		var context, newDeps, dependencyValuesChanged = false;

		if ( this.getting ) {
			// this doesn't seem to be happening anymore...

			// prevent double-computation (e.g. caused by array mutation inside computation)
			let msg = `The ${this.context.getKeypath()} computation indirectly called itself. This probably indicates a bug in the computation. It is commonly caused by \`array.sort(...)\` - if that\'s the case, clone the array first with \`array.slice().sort(...)\``;
			warnOnce( msg );
			return this.value;
		}

		this.getting = true;

		if ( this._dirty ) {
			// determine whether the inputs have changed
			// based on depends on other computed values
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

				let viewmodel = this.context.owner;
				viewmodel.capture();
				this.value = this._tryGet();
				newDeps = viewmodel.release();

				if ( this._updateDependencies( newDeps ) ) {
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

	// js engine can't optimize functions with try/catch
	// so move into own function that just does this...
	_tryGet () {
		try {
			return this.getter();
		}
		catch ( err ) {
			warnIfDebug( `Failed to compute ${this.context.getKeypath()}` );
			logIfDebug( err.stack || err );
		}
	}

	set ( value ) {
		if ( !this.setter ) {
			throw new Error( 'Computed property ${this.context.getKeypath()} does not have a setter and is read-only.' );
		}

		this.setter( value );

		return isEqual( this.get(), value );
	}

	_updateDependencies ( newDeps ) {
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

export default ComputedStore;
