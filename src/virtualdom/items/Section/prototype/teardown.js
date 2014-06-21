import teardown from 'virtualdom/items/shared/teardown';

export default function Section$teardown () {
	this.fragments.forEach( teardownFragment );
	teardown.call( this );
	this.length = 0;
}

function teardownFragment ( fragment ) {
	fragment.teardown();
}
