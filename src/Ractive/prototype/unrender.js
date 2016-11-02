import Hook from '../../events/Hook';
import { message } from '../../utils/log';
import Promise from '../../utils/Promise';
import { removeFromArray } from '../../utils/array';
import runloop from '../../global/runloop';

const unrenderHook = new Hook( 'unrender' );

export default function Ractive$unrender () {
	if ( !this.fragment.rendered ) {
		message( 'ALREADY_UNRENDERED' );
		return Promise.resolve();
	}

	const promise = runloop.start( this, true );

	// If this is a component, and the component isn't marked for destruction,
	// don't detach nodes from the DOM unnecessarily
	const shouldDestroy = !this.component || ( this.component.anchor || {} ).shouldDestroy || this.component.shouldDestroy || this.shouldDestroy;
	this.fragment.unrender( shouldDestroy );
	if ( shouldDestroy ) this.destroyed = true;

	removeFromArray( this.el.__ractive_instances__, this );

	unrenderHook.fire( this );

	runloop.end();
	return promise;
}
