export default function Element$teardown () {
	if ( this.fragment ) {
		this.fragment.unbind();
	}

	while ( this.attributes.length ) {
		this.attributes.pop().teardown();
	}
}
