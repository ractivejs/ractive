define([
	'render/DomFragment/Section/reassignFragment'
], function (
	reassignFragment
) {
	
	'use strict';

	return function ( newIndices ) {
		var section = this,
			firstChange,
			changed,
			i,
			newLength,
			newFragments,
			toTeardown,
			fragmentOptions,
			fragment,
			nextNode;

		newFragments = [];

		// first, reassign existing fragments
		newIndices.forEach( function ( newIndex, oldIndex ) {
			var by, oldKeypath, newKeypath;

			if ( newIndex === oldIndex ) {
				newFragments[ newIndex ] = section.fragments[ oldIndex ];
				return;
			}

			if ( firstChange === undefined ) {
				firstChange = oldIndex;
			}

			// does this fragment need to be torn down?
			if ( newIndex === -1 ) {
				( toTeardown || ( toTeardown = [] ) ).push( section.fragments[ oldIndex ] );
				return;
			}

			// Otherwise, it needs to be reassigned to a new index
			by = newIndex - oldIndex;
			oldKeypath = section.keypath + '.' + oldIndex;
			newKeypath = section.keypath + '.' + newIndex;

			reassignFragment( section.fragments[ oldIndex ], section.descriptor.i, oldIndex, newIndex, by, oldKeypath, newKeypath );

			newFragments[ newIndex ] = section.fragments[ oldIndex ];

			changed = true;

		});

		if ( toTeardown ) {
			while ( fragment = toTeardown.pop() ) {
				fragment.teardown( true );
			}
		}

		// If nothing changed with the existing fragments, then we start adding
		// new fragments at the end...
		if ( firstChange === undefined ) {
			firstChange = this.length;
		}

		newLength = this.root.get( this.keypath ).length;
		if ( newLength === firstChange ) {
			// ...unless there are no new fragments to add
			return;
		}

		// Prepare new fragment options
		fragmentOptions = {
			descriptor: this.descriptor.f,
			root:       this.root,
			pNode:      this.pNode,
			owner:      this
		};

		if ( this.descriptor.i ) {
			fragmentOptions.indexRef = this.descriptor.i;
		}

		// Add as many new fragments as we need to, or add back existing
		// (detached) fragments
		for ( i = firstChange; i < newLength; i += 1 ) {
			
			// is this an existing fragment?
			if ( fragment = newFragments[i] ) {
				this.docFrag.appendChild( fragment.detach( false ) );
			}

			else {
				fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
				fragmentOptions.index = i;

				fragment = this.createFragment( fragmentOptions );
			}

			this.fragments[i] = fragment;
		}

		// reinsert fragment
		nextNode = this.parentFragment.findNextNode( this );
		this.pNode.insertBefore( this.docFrag, nextNode );

		this.length = newLength;
	};

});