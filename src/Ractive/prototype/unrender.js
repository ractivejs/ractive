import removeFromArray from 'utils/removeFromArray';
import runloop from 'global/runloop';
import css from 'global/css';

export default function Ractive$unrender () {
	var promise, shouldDestroy;

	if ( !this.rendered ) {
		throw new Error( 'ractive.unrender() was called on a Ractive instance that was not rendered' );
	}

	promise = runloop.start( this, true );

	// If this is a component, and the component isn't marked for destruction,
	// don't detach nodes from the DOM unnecessarily
	shouldDestroy = !this.component || this.component.shouldDestroy;

	if ( this.constructor.css ) {
		promise.then( () => {
			css.remove( this.constructor );
		});
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
