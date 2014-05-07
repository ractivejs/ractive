import runloop from 'global/runloop';
import css from 'global/css';
import Fragment from 'parallel-dom/Fragment/_Fragment';

export default function Ractive$render ( target, anchor, callback ) {

	this._rendering = true;
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
	this.fragment = new Fragment({
		template: this.template,
		root: this,
		owner: this, // saves doing `if ( this.parent ) { /*...*/ }` later on
		pNode: target
	});

	if ( target ) {
		if ( anchor ) {
			target.insertBefore( this.fragment.render(), anchor );
		} else {
			target.appendChild( this.fragment.render() );
		}
	}

	// If this is *isn't* a child of a component that's in the process of rendering,
	// it should call any `init()` methods at this point
	if ( !this._parent || !this._parent._rendering ) {
		initChildren( this );
	}

	delete this._rendering;
	runloop.end();
}

function initChildren ( instance ) {
	var child;

	while ( child = instance._childInitQueue.shift() ) {
		if ( child.instance.init ) {
			child.instance.init( child.options );
		}

		// now do the same for grandchildren, etc
		initChildren( child.instance );
	}
}
