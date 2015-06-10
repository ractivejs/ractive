import { removeFromArray } from 'utils/array';
import { unbind as unbindFragment } from 'shared/methodCallers';
import unbind from '../../shared/unbind';

export default function Section$unbind () {

	const block = this.block;
	if ( block ) {
		this.context.unregister( 'setMembers', block );
		this.context.unregister( 'updateMembers', block );
	}

	this.fragments.forEach( unbindFragment );

	unbind.call( this );

	this.length = 0;
	this.unbound = true;
}
