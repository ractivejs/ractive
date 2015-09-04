import { getElement } from '../../utils/dom';
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
		target.innerHTML = ''; // TODO is this quicker than removeChild? Initial research inconclusive
	}

	return render( this, target, anchor );
}
