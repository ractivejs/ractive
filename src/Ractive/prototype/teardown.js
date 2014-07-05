import Promise from 'utils/Promise';

// Teardown. This goes through the root fragment and all its children, removing observers
// and generally cleaning up after itself

export default function Ractive$teardown ( callback ) {
	var promise;

	this.fire( 'teardown' );
	this.fragment.unbind();
	this.viewmodel.teardown();

	promise = ( this.rendered ? this.unrender() : Promise.resolve() );

	if ( callback ) {
		// TODO deprecate this?
		promise.then( callback.bind( this ) );
	}

	return promise;
}
