import css from 'global/css';
import Hook from './shared/hooks/Hook';
import { warn } from 'utils/log';
import Promise from 'utils/Promise';
import { removeFromArray } from 'utils/array';
import runloop from 'global/runloop';

var unrenderHook = new Hook( 'unrender' );

export default function Ractive$unrender () {
	var promise, shouldDestroy;

	if ( !this.fragment.rendered ) {
		warn( 'ractive.unrender() was called on a Ractive instance that was not rendered' );
		return Promise.resolve();
	}

	promise = runloop.start( this, true );

	// If this is a component, and the component isn't marked for destruction,
	// don't detach nodes from the DOM unnecessarily
	shouldDestroy = !this.component || this.component.shouldDestroy || this.shouldDestroy;

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

	unrenderHook.fire( this );

	runloop.end();
	return promise;
}
