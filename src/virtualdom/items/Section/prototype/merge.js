import circular from 'circular';

var Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function Section$merge ( newIndices ) {
	var section = this,
		parentFragment,
		firstChange,
		i,
		newLength,
		reboundFragments,
		fragmentOptions,
		fragment,
		nextNode;

	parentFragment = this.parentFragment;

	reboundFragments = [];

	// first, rebind existing fragments
	newIndices.forEach( function rebindIfNecessary ( newIndex, oldIndex ) {
		var fragment, by, oldKeypath, newKeypath;

		if ( newIndex === oldIndex ) {
			reboundFragments[ newIndex ] = section.fragments[ oldIndex ];
			return;
		}

		fragment = section.fragments[ oldIndex ];

		if ( firstChange === undefined ) {
			firstChange = oldIndex;
		}

		// does this fragment need to be torn down?
		if ( newIndex === -1 ) {
			fragment.unrender( true );
			fragment.teardown();
			return;
		}

		// Otherwise, it needs to be rebound to a new index
		by = newIndex - oldIndex;
		oldKeypath = section.keypath + '.' + oldIndex;
		newKeypath = section.keypath + '.' + newIndex;

		fragment.rebind( section.template.i, newIndex, oldKeypath, newKeypath );
		reboundFragments[ newIndex ] = fragment;
	});

	// If nothing changed with the existing fragments, then we start adding
	// new fragments at the end...
	if ( firstChange === undefined ) {
		firstChange = this.length;
	}

	this.length = newLength = this.root.get( this.keypath ).length;

	if ( newLength === firstChange ) {
		// ...unless there are no new fragments to add
		return;
	}

	// Prepare new fragment options
	fragmentOptions = {
		template: this.template.f,
		root:       this.root,
		owner:      this
	};

	if ( this.template.i ) {
		fragmentOptions.indexRef = this.template.i;
	}

	// Add as many new fragments as we need to, or add back existing
	// (detached) fragments
	for ( i = firstChange; i < newLength; i += 1 ) {

		// is this an existing fragment?
		if ( fragment = reboundFragments[i] ) {
			this.docFrag.appendChild( fragment.detach( false ) );
		}

		else {
			fragmentOptions.context = this.keypath + '.' + i;
			fragmentOptions.index = i;

			fragment = new Fragment( fragmentOptions );
			this.docFrag.appendChild( fragment.render() );
		}

		this.fragments[i] = fragment;
	}

	// reinsert fragment
	nextNode = parentFragment.findNextNode( this );
	this.parentFragment.getNode().insertBefore( this.docFrag, nextNode );
}
