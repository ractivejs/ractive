import Hook from 'Ractive/prototype/shared/hooks/Hook';
import removeFromArray from 'utils/removeFromArray';

var teardownHook = new Hook( 'teardown' );

export default function Component$unbind () {
	var instance = this.instance;

	this.complexParameters.forEach( unbind );
	this.resolvers.forEach( unbind );

	removeFromLiveComponentQueries( this );

	// teardown the instance
	instance.fragment.unbind();
	instance.viewmodel.teardown();

	if ( instance.fragment.rendered && instance.el.__ractive_instances__ ) {
		removeFromArray( instance.el.__ractive_instances__, instance );
	}

	teardownHook.fire( instance );
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
	} while ( instance = instance.parent );
}
