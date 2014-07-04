export default function Section$firstNode () {
	var len, i, node;

	if ( len = this.fragments.length ) {
		for ( i = 0; i < len; i += 1 ) {
			if ( node = this.fragments[i].firstNode() ) {
				return node;
			}
		}
	}

	return this.parentFragment.findNextNode( this );
}
