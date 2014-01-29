define([ 'utils/warn' ], function ( warn ) {

	'use strict';

	// We're not using a constructor here because it's convenient (and more
	// efficient) to pass e.g. transitionManager.pop as a callback, rather
	// than wrapping a prototype method in an anonymous function each time
	var makeTransitionManager = function ( root, callback ) {
		var transitionManager,
			elementsToDetach,
			transitioningNodes,
			detachNodes,
			nodeHasNoTransitioningChildren,
			checkComplete,
			parentTransitionManager;

		elementsToDetach = [];
		transitioningNodes = [];

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

			i = transitioningNodes.length;
			while ( i-- ) {
				candidate = transitioningNodes[i];

				// Because `node.contains( node ) === true`, this prevents
				// nodes from detaching during their own transition, as well
				// as during child node transitions
				if ( node.contains( candidate ) ) {
					// fail as soon as possible
					return false;
				}
			}

			return true;
		};

		checkComplete = function () {
			if ( transitionManager._ready && !transitioningNodes.length ) {
				if ( callback ) {
					callback.call( root );
				}

				if ( parentTransitionManager ) {
					parentTransitionManager.pop( root.el );
				}
			}
		};

		transitionManager = {
			push: function ( node ) {
				transitioningNodes.push( node );
			},
			pop: function ( node ) {
				var index;

				index = transitioningNodes.indexOf( node );

				if ( index === -1 ) {
					// already popped this node
					// TODO hang on, this should never happen, right?
					warn( 'This message should not appear. If it did, an unexpected situation occurred with a transition manager. Please tell @RactiveJS (http://twitter.com/RactiveJS). Thanks!' );
					return;
				}

				transitioningNodes.splice( index, 1 );

				detachNodes();
				checkComplete();
			},
			ready: function () {
				detachNodes();

				transitionManager._ready = true;
				checkComplete();
			},
			detachWhenReady: function ( element ) {
				elementsToDetach.push( element );
			}
		};

		// components need to notify parents when their
		// transitions are complete
		if ( root._parent && ( parentTransitionManager = root._parent._transitionManager ) ) {
			parentTransitionManager.push( root.el );
		}

		return transitionManager;
	};

	return makeTransitionManager;

});
