import css from 'global/css';
import Hook from 'events/Hook';
import { getElement } from 'utils/dom';
import { teardown } from 'shared/methodCallers';
import runloop from 'global/runloop';

var renderHook = new Hook( 'render' ),
	completeHook = new Hook( 'complete' );

export default function Ractive$render ( target, anchor ) {
	var promise, instances, transitionsEnabled;

	// if `noIntro` is `true`, temporarily disable transitions
	transitionsEnabled = this.transitionsEnabled;
	if ( this.noIntro ) {
		this.transitionsEnabled = false;
	}

	promise = runloop.start( this, true );
	runloop.scheduleTask( () => renderHook.fire( this ), true );

	if ( this.fragment.rendered ) {
		throw new Error( 'You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first' );
	}

	target = getElement( target ) || this.el;
	anchor = getElement( anchor ) || this.anchor;

	this.el = target;
	this.anchor = anchor;

	if ( !this.append && target ) {
		// Teardown any existing instances *before* trying to set up the new one -
		// avoids certain weird bugs
		let others = target.__ractive_instances__;
		if ( others && others.length ) {
			removeOtherInstances( others );
		}

		// make sure we are the only occupants
		target.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
	}

	if ( this.cssId ) {
		// ensure encapsulated CSS is up-to-date
		css.apply();
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

	runloop.end();

	this.transitionsEnabled = transitionsEnabled;

	return promise.then( () => completeHook.fire( this ) );
}

function removeOtherInstances ( others ) {
	others.splice( 0, others.length ).forEach( teardown );
}
