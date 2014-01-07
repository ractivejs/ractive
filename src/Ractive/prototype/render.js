define([
	'utils/getElement',
	'shared/makeTransitionManager',
	'shared/preDomUpdate',
	'shared/postDomUpdate',
	'shared/css',
	'render/DomFragment/_DomFragment'
], function (
	getElement,
	makeTransitionManager,
	preDomUpdate,
	postDomUpdate,
	css,
	DomFragment
) {

	'use strict';

	return function ( target, complete ) {
		var transitionManager;

		// This method is part of the API for one reason only - so that it can be
		// overwritten by components that don't want to use the templating system
		// (e.g. canvas-based components). It shouldn't be called outside of the
		// initialisation sequence!
		if ( !this._initing ) {
			throw new Error( 'You cannot call ractive.render() directly!' );
		}

		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// Add CSS, if applicable
		if ( this.constructor.css ) {
			css.add( this.constructor );
		}

		// Render our *root fragment*
		this.fragment = new DomFragment({
			descriptor: this.template,
			root: this,
			owner: this, // saves doing `if ( this.parent ) { /*...*/ }` later on
			pNode: target
		});

		preDomUpdate( this );

		if ( target ) {
			target.appendChild( this.fragment.docFrag );
		}

		if ( this._parent ) {
			this._parent._deferred.components.push( this );
		} else {
			postDomUpdate( this );
		}

		// transition manager has finished its work
		this._transitionManager = null;
		transitionManager.ready();

		this.rendered = true;
	};

});