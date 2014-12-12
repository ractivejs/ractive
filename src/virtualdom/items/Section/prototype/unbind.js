import { removeFromArray } from 'utils/array';
import unbind from 'virtualdom/items/shared/unbind';

export default function Section$unbind () {
	this.fragments.forEach( unbindFragment );
	this.fragmentsToRender.forEach( f => removeFromArray( this.fragments, f ) );
	this.fragmentsToRender = [];
	unbind.call( this );

	this.length = 0;
	this.unbound = true;
}

function unbindFragment ( fragment ) {
	fragment.unbind();
}
