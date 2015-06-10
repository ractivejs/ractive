import { normalise } from 'shared/keypaths';

export default class ReferenceResolver {
	constructor ( fragment, reference, callback ) {
		this.fragment = fragment;
		this.reference = normalise( reference );
		this.callback = callback;

		this.keys = this.reference.split( '.' );
		this.resolved = null;

		// TODO restricted/ancestor refs - can shortcut
		this.attemptResolution();
	}

	attemptResolution () {
		const key = this.keys[0];

		let fragment = this.fragment;
		let hasContextChain;

		while ( fragment ) {
			// repeated fragments
			if ( key === fragment.indexRef && this.keys.length === 1 ) {
				throw new Error( key );
			}

			if ( fragment.context ) {
				hasContextChain = true;

				if ( fragment.context.has( key ) ) {
					this.resolved = fragment.context.join( this.keys ); // TODO nested props...
					break;
				}
			}

			fragment = fragment.parent;
		}

		if ( !this.resolved ) {
			throw new Error( 'TODO unresolved' );
		}

		this.callback( this.resolved );
	}
}
