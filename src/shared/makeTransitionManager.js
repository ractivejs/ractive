define([
	'utils/removeFromArray'
], function (
	removeFromArray
) {

	'use strict';

	var makeTransitionManager,
		checkComplete,
		remove,
		init;

	makeTransitionManager = function ( callback, previous ) {
		var transitionManager = [];

		transitionManager.detachQueue = [];

		transitionManager.remove = remove;
		transitionManager.init = init;

		transitionManager._check = checkComplete;

		transitionManager._callback = callback;
		transitionManager._previous = previous;

		if ( previous ) {
			previous.push( transitionManager );
		}

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

			if ( this._previous ) {
				this._previous.remove( this );
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
