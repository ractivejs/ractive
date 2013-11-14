define([
	'utils/getElement',
	'shared/makeTransitionManager',
	'shared/processDeferredUpdates',
	'render/DomFragment/_DomFragment'
], function (
	getElement,
	makeTransitionManager,
	processDeferredUpdates,
	DomFragment
) {

	'use strict';

	return function ( complete ) {
		var transitionManager;

		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// Render our *root fragment*
		this.fragment = new DomFragment({
			descriptor: this.template,
			root: this,
			owner: this, // saves doing `if ( this.parent ) { /*...*/ }` later on
			pNode: this.el
		});

		processDeferredUpdates( this, true );

		if ( this.el ) {
			this.el.appendChild( this.fragment.docFrag );
		}

		// trigger intros, now that elements are in the DOM
		while ( this._defTransitions.length ) {
			this._defTransitions.pop().init(); // TODO rename...
		}

		// transition manager has finished its work
		this._transitionManager = null;
		transitionManager.ready();

		this.rendered = true;
	};

});