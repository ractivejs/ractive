import css from 'global/css';
import HookQueue from 'Ractive/prototype/shared/lifecycle/HookQueue';
import getElement from 'utils/getElement';
import runloop from 'global/runloop';

var renderHook = new HookQueue( 'render' );

export default function Ractive$render ( target, anchor ) {
	var promise, instances, transitionsEnabled;

	renderHook.begin( this );

	// if `noIntro` is `true`, temporarily disable transitions
	transitionsEnabled = this.transitionsEnabled;
	if ( this.noIntro ) {
		this.transitionsEnabled = false;
	}

	promise = runloop.start( this, true );

	if ( this.fragment.rendered ) {
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

	renderHook.end( this );

	runloop.end();

	this.transitionsEnabled = transitionsEnabled;

	if ( this.complete ) {
		promise.then( () => this.complete() );
	}

	return promise;
}


