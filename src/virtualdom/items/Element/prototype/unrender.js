import runloop from 'global/runloop';
import Transition from '../Transition/_Transition';
import { unrender as unrenderForm } from '../special/form';
import { unrender } from 'shared/methodCallers';

export default function Element$unrender ( shouldDestroy ) {
	var binding, bindings, transition;

	if ( transition = this.transition ) {
		transition.complete();
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

	if ( binding = this.binding ) {
		this.binding.unrender();

		this.node._ractive.binding = null;
		bindings = this.root._twowayBindings[ binding.keypath.str ];
		bindings.splice( bindings.indexOf( binding ), 1 );
	}

	// Remove event handlers
	if ( this.eventHandlers ) {
		this.eventHandlers.forEach( unrender );
	}

	if ( this.decorator ) {
		runloop.registerDecorator( this.decorator );
	}

	// trigger outro transition if necessary
	if ( this.root.transitionsEnabled && this.outro ) {
		transition = new Transition( this, this.outro, false );
		runloop.registerTransition( transition );
		runloop.scheduleTask( () => transition.start() );
	}

	// Remove this node from any live queries
	if ( this.liveQueries ) {
		removeFromLiveQueries( this );
	}

	if ( this.name === 'form' ) {
		unrenderForm( this );
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
