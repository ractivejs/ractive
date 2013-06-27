var makeTransitionManager = function ( root, callback ) {
	var transitionManager;

	transitionManager = {
		active: 0,
		info: { i: 0 },
		push: function () {
			transitionManager.active += 1;
			transitionManager.info.i += 1;
		},
		pop: function () {
			transitionManager.active -= 1;
			if ( callback && !transitionManager.active && transitionManager.ready ) {
				callback.call( root );
			}
		}
	};

	return transitionManager;
};