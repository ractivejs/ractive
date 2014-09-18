import HookQueue from 'Ractive/prototype/shared/lifecycle/HookQueue';
import Promise from 'utils/Promise';
import removeFromArray from 'utils/removeFromArray';

var teardownHook = new HookQueue( 'teardown' );

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

export default function Ractive$teardown ( callback ) {
	var promise;

	this.fragment.unbind();
	this.viewmodel.teardown();

	if ( this.fragment.rendered && this.el.__ractive_instances__ ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}

	this.shouldDestroy = true;
	promise = ( this.fragment.rendered ? this.unrender() : Promise.resolve() );

	teardownHook.fire( this );

	if ( callback ) {
		// TODO deprecate this?
		promise.then( callback.bind( this ) );
	}

	return promise;
}
