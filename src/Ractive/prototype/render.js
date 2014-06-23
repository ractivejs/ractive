import runloop from 'global/runloop';
import css from 'global/css';
import getElement from 'utils/getElement';

var queues = {}, rendering = {};

export default function Ractive$render ( target, anchor ) {
	var promise, instances;

	rendering[ this._guid ] = true;

	promise = runloop.start( this, true );

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
	if ( !this._parent || !rendering[ this._parent._guid ] ) {
		init( this );
	} else {
		getChildInitQueue( this._parent ).push( this );
	}

	rendering[ this._guid ] = false;
	runloop.end();

	this.rendered = true;

	if ( this.complete ) {
		promise.then( () => this.complete() );
	}

	return promise;
}

function init ( instance ) {
	if ( instance.init ) {
		instance.init( instance._config.options );
	}

	getChildInitQueue( instance ).forEach( init );
	queues[ instance._guid ] = null;
}

function getChildInitQueue ( instance ) {
	return queues[ instance._guid ] || ( queues[ instance._guid ] = [] );
}
