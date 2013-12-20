define([
	'render/DomFragment/Element/shared/executeTransition/_executeTransition'
], function (
	executeTransition
) {

	'use strict';

	return function ( destroy ) {
		var eventName, binding, bindings, i, liveQueries, selector, query, nodesToRemove, j;

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

		// Outro then detach, or just detach
		if ( this.descriptor.t2 ) {
			if ( destroy ) {
				this.root._transitionManager.detachWhenReady( this );
			}

			executeTransition( this.descriptor.t2, this.root, this, this.parentFragment.contextStack, false );
		}

		else if ( destroy ) {
			this.detach();
		}

		// Remove this node from any live queries
		if ( liveQueries = this.liveQueries ) {
			i = liveQueries.length;
			while ( i-- ) {
				selector = liveQueries[i];

				if ( nodesToRemove = this.liveQueries[ selector ] ) {
					j = nodesToRemove.length;
					query = this.root._liveQueries[ selector ];

					while ( j-- ) {
						query._remove( nodesToRemove[j] );
					}
				}
			}
		}
	};

});