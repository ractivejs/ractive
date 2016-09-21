import { splitKeypath, normalise } from '../../shared/keypaths';
import { removeFromArray } from '../../utils/array';
import resolveAmbiguousReference from './resolveAmbiguousReference';
import runloop from '../../global/runloop';

export default class ReferenceResolver {
	constructor ( fragment, reference, callback ) {
		this.fragment = fragment;
		this.reference = normalise( reference );
		this.callback = callback;

		this.keys = splitKeypath( reference );
		this.resolved = false;

		this.contexts = [];

		// TODO the consumer should take care of addUnresolved
		// we attach to all the contexts between here and the root
		// - whenever their values change, they can quickly
		// check to see if we can resolve
		while ( fragment ) {
			if ( fragment.context ) {
				fragment.context.addUnresolved( this.keys[0], this );
				this.contexts.push( fragment.context );
			}

			fragment = fragment.componentParent || fragment.parent;
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

	rebinding ( next, previous ) {
		if ( previous ) previous.removeUnresolved( this.keys[0], this );
		if ( next ) runloop.scheduleTask( () => next.addUnresolved( this.keys[0], this ) );
	}

	unbind () {
		if ( this.fragment ) removeFromArray( this.fragment.unresolved, this );

		if ( this.resolved ) return;

		this.contexts.forEach( c => c.removeUnresolved( this.keys[0], this ) );
	}
}
