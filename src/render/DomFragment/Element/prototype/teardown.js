define([
	'global/runloop',
	'render/DomFragment/Element/shared/executeTransition/_executeTransition'
], function (
	runloop,
	executeTransition
) {

	'use strict';

	return function Element_prototype_teardown ( destroy ) {
		var eventName, binding, bindings;

		// Detach as soon as we can
		if ( destroy ) {
			this.willDetach = true;
			runloop.detachWhenReady( this );
		}

		// Children first. that way, any transitions on child elements will be
		// handled by the current transitionManager
		if ( this.fragment ) {
			this.fragment.teardown( false );
		}

		while ( this.attributes.length ) {
			this.attributes.pop().teardown();
		}

		if ( this.node ) {
			for ( eventName in this.node._ractive.events ) {
				this.node._ractive.events[ eventName ].teardown();
			}

			// tear down two-way binding, if such there be
			if ( binding = this.node._ractive.binding ) {
				binding.teardown();

				bindings = this.root._twowayBindings[ binding.attr.keypath ];
				bindings.splice( bindings.indexOf( binding ), 1 );
			}
		}

		if ( this.decorator ) {
			this.decorator.teardown();
		}

		// Outro, if necessary
		if ( this.descriptor.t2 ) {
			executeTransition( this.descriptor.t2, this.root, this, false );
		}

		// Remove this node from any live queries
		if ( this.liveQueries ) {
			removeFromLiveQueries( this );
		}
	};

	function removeFromLiveQueries ( element ) {
		var query, selector, matchingStaticNodes, i, j;

		i = element.liveQueries.length;
		while ( i-- ) {
			query = element.liveQueries[i];
			selector = query.selector;

			query._remove( element.node );

			if ( element.matchingStaticNodes && ( matchingStaticNodes = element.matchingStaticNodes[ selector ] ) ) {
				j = matchingStaticNodes.length;
				while ( j-- ) {
					query.remove( matchingStaticNodes[j] );
				}
			}
		}
	}

});
