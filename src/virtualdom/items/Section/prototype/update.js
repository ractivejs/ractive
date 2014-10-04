export default function Section$update () {
	var fragment, renderIndex, renderedFragments, anchor, target, i, len;

	// `this.renderedFragments` is in the order of the previous render.
	// If fragments have shuffled about, this allows us to quickly
	// reinsert them in the correct place
	renderedFragments = this.renderedFragments;

	// Remove fragments that have been marked for destruction
	while ( fragment = this.fragmentsToUnrender.pop() ) {
		fragment.unrender( true );
		renderedFragments.splice( renderedFragments.indexOf( fragment ), 1 );
	}

	// Render new fragments (but don't insert them yet)
	while ( fragment = this.fragmentsToRender.shift() ) {
		fragment.render();
	}

	if ( this.rendered ) {
		target = this.parentFragment.getNode();
	}

	len = this.fragments.length;
	for ( i = 0; i < len; i += 1 ) {
		fragment = this.fragments[i];
		renderIndex = renderedFragments.indexOf( fragment, i ); // search from current index - it's guaranteed to be the same or higher

		if ( renderIndex === i ) {
			// already in the right place. insert accumulated nodes (if any) and carry on
			if ( this.docFrag.childNodes.length ) {
				anchor = fragment.firstNode();
				target.insertBefore( this.docFrag, anchor );
			}

			continue;
		}

		this.docFrag.appendChild( fragment.detach() );

		// update renderedFragments
		if ( renderIndex !== -1 ) {
			renderedFragments.splice( renderIndex, 1 );
		}
		renderedFragments.splice( i, 0, fragment );
	}

	if ( this.rendered && this.docFrag.childNodes.length ) {
		anchor = this.parentFragment.findNextNode( this );
		target.insertBefore( this.docFrag, anchor );
	}

	// Save the rendering order for next time
	this.renderedFragments = this.fragments.slice();
}
