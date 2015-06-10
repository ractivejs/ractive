import { normalise } from 'shared/keypaths';

export default class ReferenceResolver {
	constructor ( fragment, reference, callback ) {
		this.fragment = fragment;
		this.reference = normalise( reference );
		this.callback = callback;

		this.keys = this.reference.split( '.' );
		this.resolved = null;

		// TODO restricted/ancestor refs - can shortcut
		const model = this.attemptResolution();
		if ( model ) callback( model );
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
}
