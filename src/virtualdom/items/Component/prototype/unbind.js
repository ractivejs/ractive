export default function Component$unbind () {
	this.complexParameters.forEach( unbind );
	this.bindings.forEach( unbind );

	removeFromLiveComponentQueries( this );

	this.instance.fragment.unbind();
}

function unbind ( thing ) {
	thing.unbind();
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
