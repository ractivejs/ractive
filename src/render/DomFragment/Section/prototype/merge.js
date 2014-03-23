define([
	'shared/reassignFragment/_reassignFragment'
], function (
	reassignFragment
) {

	'use strict';

	var toTeardown = [];

	return function sectionMerge ( newIndices ) {
		var section = this,
			parentFragment,
			firstChange,
			i,
			newLength,
			reassignedFragments,
			fragmentOptions,
			fragment,
			nextNode;

		parentFragment = this.parentFragment;

		reassignedFragments = [];

		// first, reassign existing fragments
		newIndices.forEach( function reassignIfNecessary ( newIndex, oldIndex ) {
			var fragment, by, oldKeypath, newKeypath;

			if ( newIndex === oldIndex ) {
				reassignedFragments[ newIndex ] = section.fragments[ oldIndex ];
				return;
			}

			if ( firstChange === undefined ) {
				firstChange = oldIndex;
			}

			// does this fragment need to be torn down?
			if ( newIndex === -1 ) {
				toTeardown.push( section.fragments[ oldIndex ] );
				return;
			}

			// Otherwise, it needs to be reassigned to a new index
			fragment = section.fragments[ oldIndex ];

			by = newIndex - oldIndex;
			oldKeypath = section.keypath + '.' + oldIndex;
			newKeypath = section.keypath + '.' + newIndex;

			reassignFragment( fragment, section.descriptor.i, oldIndex, newIndex, by, oldKeypath, newKeypath );
			reassignedFragments[ newIndex ] = fragment;
		});

		while ( fragment = toTeardown.pop() ) {
			fragment.teardown( true );
		}

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
			descriptor: this.descriptor.f,
			root:       this.root,
			pNode:      parentFragment.pNode,
			owner:      this
		};

		if ( this.descriptor.i ) {
			fragmentOptions.indexRef = this.descriptor.i;
		}

		// Add as many new fragments as we need to, or add back existing
		// (detached) fragments
		for ( i = firstChange; i < newLength; i += 1 ) {

			// is this an existing fragment?
			if ( fragment = reassignedFragments[i] ) {
				this.docFrag.appendChild( fragment.detach( false ) );
			}

			else {
				fragmentOptions.context = this.keypath + '.' + i;
				fragmentOptions.index = i;

				fragment = this.createFragment( fragmentOptions );
			}

			this.fragments[i] = fragment;
		}

		// reinsert fragment
		nextNode = parentFragment.findNextNode( this );
		parentFragment.pNode.insertBefore( this.docFrag, nextNode );
	};

});
