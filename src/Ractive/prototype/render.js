define([
	'state/scheduler',
	'utils/getElement',
	'shared/makeTransitionManager',
	'state/css',
	'render/DomFragment/_DomFragment'
], function (
	scheduler,
	getElement,
	makeTransitionManager,
	css,
	DomFragment
) {

	'use strict';

	return function Ractive_prototype_render ( target, complete ) {
		var transitionManager;

		scheduler.start();

		// This method is part of the API for one reason only - so that it can be
		// overwritten by components that don't want to use the templating system
		// (e.g. canvas-based components). It shouldn't be called outside of the
		// initialisation sequence!
		if ( !this._initing ) {
			throw new Error( 'You cannot call ractive.render() directly!' );
		}

		// We flag up that we're going to perform an end-cycle update later,
		// otherwise we may have to do it multiple times during render
		this._updateScheduled = true;

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

		if ( target ) {
			target.appendChild( this.fragment.docFrag );
		}

		// transition manager has finished its work
		this._transitionManager = null;
		transitionManager.ready();

		this.rendered = true;

		scheduler.end();
	};

});
