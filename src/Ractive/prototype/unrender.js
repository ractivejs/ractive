import css from 'global/css';
import HookQueue from 'Ractive/prototype/shared/lifecycle/HookQueue';
import removeFromArray from 'utils/removeFromArray';
import runloop from 'global/runloop';

var unrenderHook = new HookQueue( 'unrender' );

export default function Ractive$unrender () {
	var promise, shouldDestroy;

	if ( !this.fragment.rendered ) {
		throw new Error( 'ractive.unrender() was called on a Ractive instance that was not rendered' );
	}

	unrenderHook.begin(this);

	promise = runloop.start( this, true );

	// If this is a component, and the component isn't marked for destruction,
	// don't detach nodes from the DOM unnecessarily
	shouldDestroy = !this.component || this.component.shouldDestroy;
	shouldDestroy = shouldDestroy || this.shouldDestroy;

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

	removeFromArray( this.el.__ractive_instances__, this );

	unrenderHook.end( this );

	runloop.end();
	return promise;
}
