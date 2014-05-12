export default function Triple$firstNode () {
	if ( this.nodes[0] ) {
		return this.nodes[0];
	}

	return this.parentFragment.findNextNode( this );
}
