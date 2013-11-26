define([
	'utils/getElement',
	'shared/makeTransitionManager',
	'shared/preDomUpdate',
	'shared/postDomUpdate',
	'render/DomFragment/_DomFragment'
], function (
	getElement,
	makeTransitionManager,
	preDomUpdate,
	postDomUpdate,
	DomFragment
) {

	'use strict';

	return function ( target, complete ) {
		var transitionManager;

		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// Render our *root fragment*
		this.fragment = new DomFragment({
			descriptor: this.template,
			root: this,
			owner: this, // saves doing `if ( this.parent ) { /*...*/ }` later on
			pNode: this.el
		});

		preDomUpdate( this );

		if ( target ) {
			target.appendChild( this.fragment.docFrag );
		}

		postDomUpdate( this );

		// transition manager has finished its work
		this._transitionManager = null;
		transitionManager.ready();

		this.rendered = true;
	};

});