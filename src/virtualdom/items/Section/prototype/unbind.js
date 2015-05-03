import { removeFromArray } from 'utils/array';
import { unbind as unbindFragment } from 'shared/methodCallers';
import unbind from '../../shared/unbind';

export default function Section$unbind () {
	this.fragments.forEach( unbindFragment );

	unbind.call( this );

	this.length = 0;
	this.unbound = true;
}
