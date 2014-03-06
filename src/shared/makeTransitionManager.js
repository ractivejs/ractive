define([
	'utils/removeFromArray'
], function (
	removeFromArray
) {

	'use strict';

	var makeTransitionManager,
		checkComplete,
		remove,
		init,
		previous = null;

	makeTransitionManager = function ( callback ) {
		var transitionManager = [];

		transitionManager.detachQueue = [];

		transitionManager.remove = remove;
		transitionManager.init = init;

		transitionManager._check = checkComplete;

		transitionManager._callback = callback;
		transitionManager._previous = previous;

		previous = transitionManager;
		return transitionManager;
	};

	checkComplete = function () {
		var element;

		if ( this._ready && !this.length ) {
			while ( element = this.detachQueue.pop() ) {
				element.detach();
			}

			if ( typeof this._callback === 'function' ) {
				this._callback();
			}

			if ( this._parent ) {
				this._parent.remove( this );
			}
		}
	};

	remove = function ( transition ) {
		removeFromArray( this, transition );
		this._check();
	};

	init = function () {
		this._ready = true;
		this._check();
	};

	return makeTransitionManager;

});
