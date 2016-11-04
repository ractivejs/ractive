import { getElement } from '../../utils/dom';
import { toArray } from '../../utils/array';
import render from '../render';
import { teardown } from '../../shared/methodCallers';
import { warnIfDebug } from '../../utils/log';

export default function Ractive$render ( target, anchor ) {
	if ( this.torndown ) {
		warnIfDebug( 'ractive.render() was called on a Ractive instance that was already torn down' );
		return Promise.resolve();
	}

	target = getElement( target ) || this.el;

	if ( !this.append && target ) {
		// Teardown any existing instances *before* trying to set up the new one -
		// avoids certain weird bugs
		const others = target.__ractive_instances__;
		if ( others ) others.forEach( teardown );

		// make sure we are the only occupants
		if ( !this.enhance ) {
			target.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
		}
	}

	const occupants = this.enhance ? toArray( target.childNodes ) : null;
	const promise = render( this, target, anchor, occupants );

	if ( occupants ) {
		while ( occupants.length ) target.removeChild( occupants.pop() );
	}

	return promise;
}
