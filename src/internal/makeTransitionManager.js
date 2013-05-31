var makeTransitionManager = function ( callback ) {
	var transitionManager;

	transitionManager = {
		active: 0,
		push: function () {
			transitionManager.active += 1;
		},
		pop: function () {
			transitionManager.active -= 1;
			if ( !transitionManager.active && transitionManager.ready ) {
				callback();
			}
		}
	};

	return transitionManager;
};