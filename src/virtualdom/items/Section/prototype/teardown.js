import teardown from 'virtualdom/items/shared/teardown';

export default function Section$teardown () {
	this.fragments.forEach( unbindFragment );
	teardown.call( this );
	this.length = 0;
}

function unbindFragment ( fragment ) {
	fragment.unbind();
}
