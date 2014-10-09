import unbind from 'virtualdom/items/shared/unbind';

export default function Section$unbind () {
	this.fragments.forEach( unbindFragment );
	unbind.call( this );

	this.length = 0;
	this.unbound = true;
}

function unbindFragment ( fragment ) {
	fragment.unbind();
}
