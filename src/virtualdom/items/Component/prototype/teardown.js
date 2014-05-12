export default function Component$teardown () {
	while ( this.complexParameters.length ) {
		this.complexParameters.pop().teardown();
	}

	while ( this.bindings.length ) {
		this.bindings.pop().teardown();
	}

	removeFromLiveComponentQueries( this );

	// Add this flag so that we don't unnecessarily destroy the component's nodes
	// TODO rethink the semantics of init/teardown/render/unrender?
	this.shouldDestroy = false;
	this.instance.fragment.teardown();
}

function removeFromLiveComponentQueries ( component ) {
	var instance, query;

	instance = component.root;

	do {
		if ( query = instance._liveComponentQueries[ '_' + component.name ] ) {
			query._remove( component );
		}
	} while ( instance = instance._parent );
}
