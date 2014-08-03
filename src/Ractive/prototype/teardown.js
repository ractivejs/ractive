import removeFromArray from 'utils/removeFromArray';
import Promise from 'utils/Promise';

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

export default function Ractive$teardown ( callback ) {
	var promise;

	this.fire( 'teardown' );
	this.fragment.unbind();
	this.viewmodel.teardown();

	if ( this.rendered && this.el.__ractive_instances__ ) {
		removeFromArray( this.el.__ractive_instances__, this );
	}

	promise = ( this.rendered ? this.unrender() : Promise.resolve() );

	if ( callback ) {
		// TODO deprecate this?
		promise.then( callback.bind( this ) );
	}

	return promise;
}
