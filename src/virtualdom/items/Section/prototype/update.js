export default function Section$update () {
	var fragment, rendered, index, nextFragment, anchor, target;

	while ( fragment = this.fragmentsToUnrender.pop() ) {
		fragment.unrender( true );
	}

	// If we have no new nodes to insert (i.e. the section length stayed the
	// same, or shrank), we don't need to go any further
	if ( !this.fragmentsToRender.length ) {
		return;
	}

	if ( this.rendered ) {
		target = this.parentFragment.getNode();
	}

	// Render new fragments to our docFrag
	while ( fragment = this.fragmentsToRender.shift() ) {
		rendered = fragment.render();
		this.docFrag.appendChild( rendered );

		// If this is an ordered list, and it's already rendered, we may
		// need to insert content into the appropriate place
		if ( this.rendered && this.ordered ) {

			// If the next fragment is already rendered, use it as an anchor...
			nextFragment = this.fragments[ fragment.index + 1 ];
			if ( nextFragment && nextFragment.rendered ) {
				target.insertBefore( this.docFrag, nextFragment.firstNode() );
			}

			// ...otherwise continue appending to the document fragment for
			// a later batch append
		}
	}

	if ( this.rendered && this.docFrag.childNodes.length ) {
		anchor = this.parentFragment.findNextNode( this );
		target = this.parentFragment.getNode();

		target.insertBefore( this.docFrag, anchor );
	}
}
