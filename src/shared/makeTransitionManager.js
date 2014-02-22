define([
	'utils/warn',
	'utils/removeFromArray'
], function (
	warn,
	removeFromArray
) {

	'use strict';

	var makeTransitionManager,
		checkComplete,
		remove,
		init;

	makeTransitionManager = function ( ractive, callback ) {
		var transitionManager = [];

		transitionManager.detachQueue = [];

		transitionManager.remove = remove;
		transitionManager.init = init;

		transitionManager._check = checkComplete;

		transitionManager._root = ractive;
		transitionManager._callback = callback;
		transitionManager._previous = ractive._transitionManager;

		// components need to notify parents when their
		// transitions are complete
		if ( ractive._parent && ( transitionManager._parent = ractive._parent._transitionManager ) ) {
			transitionManager._parent.push( transitionManager );
		}

		return transitionManager;
	};

	checkComplete = function () {
		var ractive, element;

		if ( this._ready && !this.length ) {
			ractive = this._root;

			while ( element = this.detachQueue.pop() ) {
				element.detach();
			}

			if ( typeof this._callback === 'function' ) {
				this._callback.call( ractive );
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

		// Revert to previous transition manager, if applicable
		if ( this._previous ) {
			this._root._transitionManager = this._previous;
		}
	};

	return makeTransitionManager;

});
