import css from 'global/css';
import Hook from 'events/Hook';
import { getElement } from 'utils/dom';
import runloop from 'global/runloop';

const renderHook = new Hook( 'render' );
const completeHook = new Hook( 'complete' );

export default function render ( ractive, target, anchor ) {
	// if `noIntro` is `true`, temporarily disable transitions
	const transitionsEnabled = ractive.transitionsEnabled;
	if ( ractive.noIntro ) ractive.transitionsEnabled = false;

	const promise = runloop.start( ractive, true );
	runloop.scheduleTask( () => renderHook.fire( ractive ), true );

	if ( ractive.fragment.rendered ) {
		throw new Error( 'You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first' );
	}

	anchor = getElement( anchor ) || ractive.anchor;

	ractive.el = target;
	ractive.anchor = anchor;

	// ensure encapsulated CSS is up-to-date
	if ( ractive.cssId ) css.apply();

	if ( target ) {
		( target.__ractive_instances__ || ( target.__ractive_instances__ = [] ) ).push( ractive );

		if ( anchor ) {
			const docFrag = document.createDocumentFragment();
			ractive.fragment.render( docFrag );
			target.insertBefore( docFrag, anchor );
		} else {
			ractive.fragment.render( target );
		}
	}

	runloop.end();
	ractive.transitionsEnabled = transitionsEnabled;

	return promise.then( () => completeHook.fire( ractive ) );
}
