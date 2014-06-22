export default function Element$unbind () {
	if ( this.fragment ) {
		this.fragment.unbind();
	}

	while ( this.attributes.length ) {
		this.attributes.pop().teardown();
	}
}
