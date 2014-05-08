export default function Section$findNextNode ( fragment ) {
	if ( this.fragments[ fragment.index + 1 ] ) {
		return this.fragments[ fragment.index + 1 ].firstNode();
	}

	return this.parentFragment.findNextNode( this );
}
