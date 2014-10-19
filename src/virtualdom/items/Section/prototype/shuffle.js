import types from 'config/types';
import runloop from 'global/runloop';
import circular from 'circular';

var Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function Section$shuffle ( newIndices ) {
	var section = this,
		parentFragment,
		firstChange,
		i,
		newLength,
		reboundFragments,
		fragmentOptions,
		fragment;

	// short circuit any double-updates, and ensure that this isn't applied to
	// non-list sections
	if ( this.shuffling || this.unbound || ( this.subtype && this.subtype !== types.SECTION_EACH ) ) {
		return;
	}

	this.shuffling = true;
	runloop.scheduleTask( () => this.shuffling = false );

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
			section.fragmentsToUnrender.push( fragment );
			fragment.unbind();
			return;
		}

		// Otherwise, it needs to be rebound to a new index
		by = newIndex - oldIndex;
		oldKeypath = section.keypath + '.' + oldIndex;
		newKeypath = section.keypath + '.' + newIndex;

		fragment.index = newIndex;
		reboundFragments[ newIndex ] = fragment;
	});

	newLength = this.root.get( this.keypath ).length;

	// If nothing changed with the existing fragments, then we start adding
	// new fragments at the end...
	if ( firstChange === undefined ) {
		// ...unless there are no new fragments to add
		if ( this.length === newLength ) {
			return;
		}

		firstChange = this.length;
	}

	this.length = this.fragments.length = newLength;

	if ( this.rendered ) {
		runloop.addView( this );
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
		fragment = reboundFragments[i];

		if ( !fragment ) {
			this.fragmentsToCreate.push( i );
		}

		this.fragments[i] = fragment;
	}
}
