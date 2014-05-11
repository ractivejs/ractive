export default function Element$teardown () {
	if ( this.fragment ) {
		this.fragment.teardown();
	}

	while ( this.attributes.length ) {
		this.attributes.pop().teardown();
	}
}
