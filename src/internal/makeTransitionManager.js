// We're not using a constructor here because it's convenient (and more
// efficient) to pass e.g. transitionManager.pop as a callback, rather
// than wrapping a prototype method in an anonymous function each time
makeTransitionManager = function ( root, callback ) {
	var transitionManager;

	transitionManager = {
		active: 0,
		info: { i: 0 },
		push: function () {
			transitionManager.active += 1;
			transitionManager.info.i += 1;
		},
		pop: function () {
			var i, node;

			transitionManager.active -= 1;
			if ( !transitionManager.active && transitionManager.ready ) {
				transitionManager.complete();
			}
		},
		complete: function () {
			var i, node;

			i = transitionManager.nodesToDetach.length;
			while ( i-- ) {
				node = transitionManager.nodesToDetach.pop();
				node.parentNode.removeChild( node );
			}

			if ( callback ) {
				callback.call( root );
			}
		},
		nodesToDetach: []
	};

	return transitionManager;
};