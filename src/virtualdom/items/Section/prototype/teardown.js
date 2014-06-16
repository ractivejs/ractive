import teardown from 'virtualdom/items/shared/teardown';

export default function Section$teardown () {
	this.fragments.forEach( teardownFragment );
	teardown.call( this );
}

function teardownFragment ( fragment ) {
	fragment.teardown();
}
