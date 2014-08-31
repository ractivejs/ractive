define(['global/runloop','virtualdom/items/Element/Transition/_Transition'],function (runloop, Transition) {

	'use strict';
	
	var __export;
	
	__export = function Element$unrender ( shouldDestroy ) {
		var binding, bindings;
	
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
			bindings = this.root._twowayBindings[ binding.keypath ];
			bindings.splice( bindings.indexOf( binding ), 1 );
		}
	
		// Remove event handlers
		if ( this.eventHandlers ) {
			this.eventHandlers.forEach( function(h ) {return h.unrender()} );
		}
	
		if ( this.decorator ) {
			this.decorator.teardown();
		}
	
		// trigger outro transition if necessary
		if ( this.root.transitionsEnabled && this.outro ) {
			var transition = new Transition ( this, this.outro, false );
			runloop.registerTransition( transition );
			runloop.scheduleTask( function()  {return transition.start()} );
		}
	
		// Remove this node from any live queries
		if ( this.liveQueries ) {
			removeFromLiveQueries( this );
		}
	
		// Remove from nodes
		if ( this.node.id ) {
			delete this.root.nodes[ this.node.id ];
		}
	};
	
	function removeFromLiveQueries ( element ) {
		var query, selector, i;
	
		i = element.liveQueries.length;
		while ( i-- ) {
			query = element.liveQueries[i];
			selector = query.selector;
	
			query._remove( element.node );
		}
	}
	return __export;

});