import css from 'global/css';
import Hook from 'Ractive/prototype/shared/hooks/Hook';
import getElement from 'utils/getElement';
import runloop from 'global/runloop';

var renderHook = new Hook( 'render' ),
	completeHook = new Hook( 'complete' );

export default function Ractive$render ( target, anchor ) {
	var promise, instances, transitionsEnabled;

	// Teardown any existing instances *before* trying to set up the new one -
	// avoids certain weird bugs
	if ( !this.append && target && target.__ractive_instances__ && target.__ractive_instances__.length > 0 ) {
		try {
			target.__ractive_instances__.splice( 0, target.__ractive_instances__.length ).forEach( r => r.teardown() );
		} catch ( err ) {
			// this can happen with IE8, because it is unbelievably shit. Somehow, in
			// certain very specific situations, trying to access node.parentNode (which
			// we need to do in order to detach elements) causes an 'Invalid argument'
			// error to be thrown. I don't even.
		}
		target.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
	}

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


