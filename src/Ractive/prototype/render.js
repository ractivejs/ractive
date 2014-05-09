import runloop from 'global/runloop';
import css from 'global/css';
import Promise from 'utils/Promise';

export default function Ractive$render ( target, anchor ) {

	var promise, fulfilPromise;

	this._rendering = true;

	promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
	runloop.start( this, fulfilPromise );

	if ( this.rendered ) {
		throw new Error( 'You cannot call ractive.render() more than once!' );
	}

	this.el = target;
	this.anchor = anchor;

	// Add CSS, if applicable
	if ( this.constructor.css ) {
		css.add( this.constructor );
	}

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
	} else {
		this._parent._childInitQueue.push( this );
	}

	delete this._rendering;
	runloop.end();

	this.rendered = true;

	return promise;
}

function initChildren ( instance ) {
	var child;

	while ( child = instance._childInitQueue.shift() ) {
		if ( child.init ) {
			child.init( child.initOptions );
		}

		// now do the same for grandchildren, etc
		initChildren( child );
	}
}
