export default function Section$firstNode () {
	if ( this.fragments[0] ) {
		return this.fragments[0].firstNode();
	}

	return this.parentFragment.findNextNode( this );
}
