import css from 'global/css';
import Hook from 'Ractive/prototype/shared/hooks/Hook';
import HookQueue from 'Ractive/prototype/shared/hooks/HookQueue';
import getElement from 'utils/getElement';
import runloop from 'global/runloop';

var renderHook = new HookQueue( 'render' ),
	completeHook = new Hook( 'complete' );

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

	// It is now more problematic to know if the complete hook
	// would fire. Method checking is straight-forward, but would
	// also require preflighting event subscriptions. Which seems
	// like more work then just letting the promise happen.
	// But perhaps I'm wrong about that...
	promise.then( () => completeHook.fire( this ) );

	return promise;
}


