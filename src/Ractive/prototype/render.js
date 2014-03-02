define([
	'global/runloop',
	'global/css',
	'render/DomFragment/_DomFragment'
], function (
	runloop,
	css,
	DomFragment
) {

	'use strict';

	return function Ractive_prototype_render ( target, callback ) {

		runloop.start( this, callback );

		// This method is part of the API for one reason only - so that it can be
		// overwritten by components that don't want to use the templating system
		// (e.g. canvas-based components). It shouldn't be called outside of the
		// initialisation sequence!
		if ( !this._initing ) {
			throw new Error( 'You cannot call ractive.render() directly!' );
		}

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

		this.rendered = true;
		runloop.end();

		// If this is a top-level instance (i.e. it was created with `var ractive = new Ractive()`,
		// or `widget = new Widget()` etc), we need to initialise any child components now that
		// they're in the DOM
		// TODO should this be handled by the runloop?
		if ( !this._parent ) {
			initChildren( this );
		}
	};

	function initChildren ( instance ) {
		var child;

		while ( child = instance._childInitQueue.pop() ) {
			if ( child.instance.init ) {
				child.instance.init( child.options );
			}

			// now do the same for grandchildren, etc
			initChildren( child.instance );
		}
	}

});
