import runloop from 'global/runloop';

export default function Element$unrender ( shouldDestroy ) {
	var binding, bindings, outro;

	// Detach as soon as we can
	if ( shouldDestroy ) {
		this.willDetach = true;
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
		bindings = this.root._twowayBindings[ binding.keypath ];
		bindings.splice( bindings.indexOf( binding ), 1 );
	}

	// Remove event handlers
	if ( this.eventHandlers ) {
		this.eventHandlers.forEach( h => h.unrender() );
	}

	if ( this.decorator ) {
		this.decorator.teardown();
	}

	// Outro, if necessary
	if ( outro = this.outro ) {
		runloop.registerTransition( outro );
		runloop.scheduleTask( () => outro.start( false ) );
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
