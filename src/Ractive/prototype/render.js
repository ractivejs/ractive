import runloop from 'global/runloop';
import css from 'global/css';
import Promise from 'utils/Promise';
import getElement from 'utils/getElement';

export default function Ractive$render ( target, anchor ) {

	var promise, fulfilPromise, instances;

	this._rendering = true;

	promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
	runloop.start( this, fulfilPromise );

	if ( this.rendered ) {
		throw new Error( 'You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first' );
	}

	target = getElement( target ) || this.el;
	anchor = getElement( anchor ) || this.anchor;

	this.el = target;
	this.anchor = anchor;

	// Add CSS, if applicable
	if ( this.constructor.css ) {
		css.add( this.constructor );
	}

	if ( target ) {
		if ( !( instances = target.__ractive_instances__ ) ) {
			target.__ractive_instances__ = [ this ];
		} else {
			instances.push( this );
		}

		if ( anchor ) {
			target.insertBefore( this.fragment.render(), anchor );
		} else {
			target.appendChild( this.fragment.render() );
		}
	}

	// If this is *isn't* a child of a component that's in the process of rendering,
	// it should call any `init()` methods at this point
	if ( !this._parent || !this._parent._rendering ) {
		init( this );
	} else {
		this._parent._childInitQueue.push( this );
	}

	delete this._rendering;
	runloop.end();

	this.rendered = true;

	return promise;
}

function init ( instance ) {
	if ( instance.init ) {
		instance.init( instance._config.options );
	}

	instance._childInitQueue.splice( 0 ).forEach( init );
}
