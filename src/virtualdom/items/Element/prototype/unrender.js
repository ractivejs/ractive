import runloop from 'global/runloop';
import Transition from 'virtualdom/items/Element/Transition/_Transition';
import bindingHelpers from 'virtualdom/items/Element/prototype/bindingHelpers';

export default function Element$unrender ( shouldDestroy ) {
	if ( this.transition ) {
		this.transition.complete();
	}

	// Detach as soon as we can
	if ( this.name === 'option' ) {
		// <option> elements detach immediately, so that
		// their parent <select> element syncs correctly, and
		// since option elements can't have transitions anyway
		this.detach();
	} else if ( shouldDestroy ) {
		runloop.detachWhenReady( this );
	}

	// Children first. that way, any transitions on child elements will be
	// handled by the current transitionManager
	if ( this.fragment ) {
		this.fragment.unrender( false );
	}

	// remove binding if there is one
	bindingHelpers.unregisterTwowayBinding( this );

	// Remove event handlers
	bindingHelpers.unregisterEventHandlers( this );

	bindingHelpers.unregisterDecorator( this );

	// trigger outro transition if necessary
	if ( this.root.transitionsEnabled && this.outro ) {
		let transition = new Transition ( this, this.outro, false );
		runloop.registerTransition( transition );
		runloop.scheduleTask( () => transition.start() );
	}

	// Remove this node from any live queries
	if ( this.liveQueries ) {
		removeFromLiveQueries( this );
	}
}

function removeFromLiveQueries ( element ) {
	var query, selector, i;

	i = element.liveQueries.length;
	while ( i-- ) {
		query = element.liveQueries[i];
		selector = query.selector;

		query._remove( element.node );
	}
}
