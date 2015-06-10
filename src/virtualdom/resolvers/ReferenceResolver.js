export default class ExpressionResolver {
	constructor ( fragment, reference, callback ) {
		this.fragment = fragment;
		this.reference = reference;
		this.callback = callback;

		this.resolved = null;

		// TODO restricted/ancestor refs - can shortcut
		this.attemptResolution();
	}

	attemptResolution () {
		const keys = this.reference.split( '.' );
		const key = keys[0];

		let fragment = this.fragment;
		let hasContextChain;

		while ( fragment ) {
			if ( fragment.context ) {
				hasContextChain = true;

				if ( fragment.context.has( key ) ) {
					this.resolved = fragment.context.join( this.reference ); // TODO nested props...
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
