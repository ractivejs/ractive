define( function () {

	'use strict';

	// We're not using a constructor here because it's convenient (and more
	// efficient) to pass e.g. transitionManager.pop as a callback, rather
	// than wrapping a prototype method in an anonymous function each time
	var makeTransitionManager = function ( root, callback ) {
		var transitionManager, elementsToDetach, detachNodes, nodeHasNoTransitioningChildren;

		elementsToDetach = [];

		// detach any nodes which a) need to be detached and b) have no child nodes
		// which are actively transitioning. This will be called each time a
		// transition completes
		detachNodes = function () {
			var i, element;

			i = elementsToDetach.length;
			while ( i-- ) {
				element = elementsToDetach[i];

				// see if this node can be detached yet
				if ( nodeHasNoTransitioningChildren( element.node ) ) {
					element.detach();
					elementsToDetach.splice( i, 1 );
				}
			}
		};

		nodeHasNoTransitioningChildren = function ( node ) {
			var i, candidate;

			i = transitionManager.active.length;
			while ( i-- ) {
				candidate = transitionManager.active[i];

				if ( node.contains( candidate ) ) {
					// fail as soon as possible
					return false;
				}
			}

			return true;
		};

		transitionManager = {
			active: [],
			push: function ( node ) {
				transitionManager.active[ transitionManager.active.length ] = node;
			},
			pop: function ( node ) {
				var index;

				index = transitionManager.active.indexOf( node );

				if ( index === -1 ) {
					// already popped this node
					return;
				}

				transitionManager.active.splice( index, 1 );
				
				detachNodes();

				if ( !transitionManager.active.length && transitionManager._ready ) {
					transitionManager.complete();
				}
			},
			complete: function () {
				if ( callback ) {
					callback.call( root );
				}
			},
			ready: function () {
				detachNodes();

				transitionManager._ready = true;
				if ( !transitionManager.active.length ) {
					transitionManager.complete();
				}
			},
			detachWhenReady: function ( element ) {
				elementsToDetach[ elementsToDetach.length ] = element;
			}
		};

		return transitionManager;
	};

	return makeTransitionManager;

});