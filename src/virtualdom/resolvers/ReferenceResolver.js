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
				keys = splitKeypath( reference.slice( 2 ) );
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

			const model = this.attemptResolution();
			if ( model ) callback( model );
		}
	}

	attemptResolution () {
		const key = this.keys[0];

		let fragment = this.fragment;

		if ( key[0] === '.' ) {
			// restricted reference
			while ( !fragment.context ) fragment = fragment.parent;
			const context = fragment.context;
			const keys = this.keys.slice();

			console.log( 'keys', keys )
		}

		let hasContextChain;

		while ( fragment ) {
			// repeated fragments
			if ( key === fragment.indexRef && this.keys.length === 1 ) {
				throw new Error( key );
			}

			if ( fragment.context ) {
				if ( !fragment.isRoot ) hasContextChain = true;

				if ( fragment.context.has( key ) ) {
					return fragment.context.join( this.keys );
				}
			}

			fragment = fragment.parent;
		}

		if ( !hasContextChain ) return this.fragment.ractive.viewmodel.join( this.keys );

		this.fragment.unresolved.push( this );
	}

	unbind () {
		removeFromArray( this.fragment.unresolved, this );
	}
}
