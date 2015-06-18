import { normalise } from 'shared/keypaths';
import { removeFromArray } from 'utils/array';

export default class ReferenceResolver {
	constructor ( fragment, reference, callback ) {
		this.fragment = fragment;
		this.reference = normalise( reference );
		this.callback = callback;

		this.isRestricted = reference[0] === '.' || reference[0] === '~';

		if ( this.isRestricted ) {
			let context;
			let keys;

			if ( reference[0] === '~' ) {
				keys = reference.slice( 2 ).split( '.' );
				context = fragment.ractive.viewmodel;
			} else {
				while ( !fragment.context ) fragment = fragment.parent;
				context = fragment.context;

				const parts = reference.split( '/' );

				while ( parts[0] === '.' || parts[0] === '..' ) {
					const part = parts.shift();

					if ( part === '..' ) {
						context = context.parent;
					}
				}

				reference = parts.join( '/' );

				// special case - `{{.foo}}` means the same as `{{./foo}}`
				if ( reference[0] === '.' ) reference = reference.slice( 1 );

				keys = reference.split( '.' );
			}

			const model = context.join( keys );
			callback( model );
		}

		else {
			this.keys = reference.split( '.' );
			this.resolved = null;

			this.attemptResolution();
			if ( !this.resolved ) {
				// we attach to all the contexts between here and the root
				// - whenever their values change, they can quickly
				// check to see if we can resolve
				while ( fragment ) {
					if ( fragment.context ) {
						fragment.context.addUnresolved( this.keys[0], this );
					}

					fragment = fragment.parent;
				}
			}
		}
	}

	attemptResolution () {
		if ( this.resolved ) return;

		const localViewmodel = this.fragment.ractive.viewmodel;
		const key = this.keys[0];

		let fragment = this.fragment;
		let hasContextChain;
		let crossedComponentBoundary;

		while ( fragment ) {
			// repeated fragments
			if ( ( key === fragment.indexRef || key === fragment.keyRef ) && this.keys.length > 1 ) {
				throw new Error( `An index or key reference (${key}) cannot have child properties` );
			}

			if ( fragment.context ) {
				// TODO better encapsulate the component check
				if ( !fragment.isRoot || fragment.ractive.component ) hasContextChain = true;

				if ( fragment.context.has( key ) ) {
					if ( crossedComponentBoundary ) {
						localViewmodel.map( key, fragment.context.join([ key ]) );
					}

					const model = fragment.context.join( this.keys );
					this.callback( model );
					this.resolved = true;

					return;
				}
			}

			if ( fragment.componentParent && !fragment.ractive.isolated ) {
				// ascend through component boundary
				fragment = fragment.componentParent;
				crossedComponentBoundary = true;
			} else {
				fragment = fragment.parent;
			}
		}

		// TODO we can determine this immediately, don't need to wait for attemptResolution
		if ( !hasContextChain ) {
			const model = this.fragment.ractive.viewmodel.join( this.keys );
			this.callback( model );
			this.resolved = true;
		}
	}

	forceResolution () {
		if ( this.resolved ) return;

		const model = this.fragment.findContext().join( this.keys )
		this.callback( model );
		this.resolved = true;
	}

	unbind () {
		removeFromArray( this.fragment.unresolved, this );
	}
}
