import { normalise } from 'shared/keypaths';
import { removeFromArray } from 'utils/array';
import resolveAmbiguousReference from './resolveAmbiguousReference';

export default class ReferenceResolver {
	constructor ( fragment, reference, callback ) {
		this.fragment = fragment;
		this.reference = normalise( reference );
		this.callback = callback;

		this.keys = reference.split( '.' );
		this.resolved = null;

		// TODO the consumer should take care of addUnresolved
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

	attemptResolution () {
		if ( this.resolved ) return;

		const model = resolveAmbiguousReference( this.fragment, this.reference );

		if ( model ) {
			this.resolved = true;
			this.callback( model );
		}
	}

	forceResolution () {
		if ( this.resolved ) return;

		const model = this.fragment.findContext().joinAll( this.keys );
		this.callback( model );
		this.resolved = true;
	}

	unbind () {
		removeFromArray( this.fragment.unresolved, this );
	}
}
