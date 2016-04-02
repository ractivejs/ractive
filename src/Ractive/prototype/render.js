import { getElement } from '../../utils/dom';
import { toArray } from '../../utils/array';
import render from '../render';
import { teardown } from '../../shared/methodCallers';

export default function Ractive$render ( target, anchor ) {
	target = getElement( target ) || this.el;

	if ( !this.append && target ) {
		// Teardown any existing instances *before* trying to set up the new one -
		// avoids certain weird bugs
		let others = target.__ractive_instances__;
		if ( others ) others.forEach( teardown );

		// make sure we are the only occupants
		if ( !this.enhance ) {
			target.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
		}
	}

	let occupants = this.enhance ? toArray( target.childNodes ) : null;
	const promise = render( this, target, anchor, occupants );

	if ( occupants ) {
		while ( occupants.length ) target.removeChild( occupants.pop() );
	}

	return promise;
}
