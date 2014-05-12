export default function Section$update () {
	var fragment, anchor, target;

	// if we have no new nodes to insert (i.e. the section length stayed the
	// same, or shrank), we don't need to go any further
	if ( !this.unrenderedFragments.length ) {
		return;
	}

	// Render new fragments to our docFrag
	while ( fragment = this.unrenderedFragments.shift() ) {
		this.docFrag.appendChild( fragment.render() );
	}

	if ( this.rendered ) {
		anchor = this.insertionPoint || this.parentFragment.findNextNode( this );
		target = this.parentFragment.getNode();

		target.insertBefore( this.docFrag, anchor );
		this.insertionPoint = null;
	}
}
