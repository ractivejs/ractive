import types from 'config/types';
import removeFromArray from 'utils/removeFromArray';
import runloop from 'global/runloop';
import css from 'global/css';

export default function Ractive$unrender () {
	var promise, shouldDestroy, fragment, nearestDetachingElement;

	if ( !this.rendered ) {
		throw new Error( 'ractive.unrender() was called on a Ractive instance that was not rendered' );
	}

	promise = runloop.start( this, true );

	// If this is a component, and the component isn't marked for destruction,
	// don't detach nodes from the DOM unnecessarily
	shouldDestroy = !this.component || this.component.shouldDestroy;

	if ( this.constructor.css ) {
		// We need to find the nearest detaching element. When it gets removed
		// from the DOM, it's safe to remove our CSS
		if ( shouldDestroy ) {
			promise.then( () => css.remove( this.constructor ) );
		} else {
			fragment = this.component.parentFragment;

			do {
				if ( fragment.owner.type !== types.ELEMENT ) {
					continue;
				}

				if ( fragment.owner.willDetach ) {
					nearestDetachingElement = fragment.owner;
				}
			} while ( !nearestDetachingElement && ( fragment = fragment.parent ) );

			if ( !nearestDetachingElement ) {
				throw new Error( 'A component is being torn down but doesn\'t have a nearest detaching element... this shouldn\'t happen!' );
			}

			nearestDetachingElement.cssDetachQueue.push( this.constructor );
		}
	}

	// Cancel any animations in progress
	while ( this._animations[0] ) {
		this._animations[0].stop(); // it will remove itself from the index
	}

	this.fragment.unrender( shouldDestroy );
	this.rendered = false;

	removeFromArray( this.el.__ractive_instances__, this );

	runloop.end();
	return promise;
}
