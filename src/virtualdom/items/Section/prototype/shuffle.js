import { SECTION_EACH } from 'config/types';
import runloop from 'global/runloop';

export default function Section$shuffle ( newIndices ) {
	var parentFragment,
		firstChange,
		i,
		newLength,
		reboundFragments,
		fragmentOptions,
		fragment;

	// short circuit any double-updates, and ensure that this isn't applied to
	// non-list sections
	if ( this.shuffling || this.unbound || ( this.currentSubtype !== SECTION_EACH ) ) {
		return;
	}

	this.shuffling = true;
	runloop.scheduleTask( () => this.shuffling = false );

	parentFragment = this.parentFragment;

	reboundFragments = [];

	// TODO: need to update this
	// first, rebind existing fragments
	newIndices.forEach( ( newIndex, oldIndex ) => {
		var fragment, by, oldKeypath, newKeypath, deps;

		if ( newIndex === oldIndex ) {
			reboundFragments[ newIndex ] = this.fragments[ oldIndex ];
			return;
		}

		fragment = this.fragments[ oldIndex ];

		if ( firstChange === undefined ) {
			firstChange = oldIndex;
		}

		// does this fragment need to be torn down?
		if ( newIndex === -1 ) {
			this.fragmentsToUnrender.push( fragment );
			fragment.unbind();
			return;
		}

		// Otherwise, it needs to be rebound to a new index
		by = newIndex - oldIndex;
		oldKeypath = this.keypath.join( oldIndex );
		newKeypath = this.keypath.join( newIndex );

		fragment.index = newIndex;

		// notify any registered index refs directly
		if ( deps = fragment.registeredIndexRefs ) {
			deps.forEach( blindRebind );
		}

		fragment.rebind( oldKeypath, newKeypath );
		reboundFragments[ newIndex ] = fragment;
	});

	newLength = this.root.viewmodel.get( this.keypath ).length;

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

function blindRebind ( dep ) {
	// the keypath doesn't actually matter here as it won't have changed
	dep.rebind( '', '' );
}
