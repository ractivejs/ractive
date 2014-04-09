define([
	'render/DomFragment/Section/reassignFragments'
], function (
	reassignFragments
) {

	'use strict';

	return function ( spliceSummary ) {
		var section = this, balance, start, insertStart, insertEnd, spliceArgs;

		balance = spliceSummary.balance;

		if ( !balance ) {
			// The array length hasn't changed - we don't need to add or remove anything
			return;
		}

		start = spliceSummary.start;
		section.length += balance;

		// If more items were removed from the array than added, we tear down
		// the excess fragments and remove them...
		if ( balance < 0 ) {
			section.fragments.splice( start, -balance ).forEach( teardown );

			// Reassign fragments after the ones we've just removed
			reassignFragments( section, start, section.length, balance );

			// Nothing more to do
			return;
		}

		// ...otherwise we need to add some things to the DOM.
		insertStart = start + spliceSummary.removed;
		insertEnd = start + spliceSummary.added;

		// Make room for the new fragments by doing a splice that simulates
		// what happened to the data array
		spliceArgs = [ insertStart, 0 ];
		spliceArgs.length += balance;
		section.fragments.splice.apply( section.fragments, spliceArgs );

		// Reassign existing fragments at the end of the array
		reassignFragments( section, insertEnd, section.length, balance );

		// Create the new ones
		renderNewFragments( section, insertStart, insertEnd );
	};

	function teardown ( fragment ) {
		fragment.teardown( true );
	}

	function renderNewFragments ( section, start, end ) {
		var fragmentOptions, i, insertionPoint;

		section.rendering = true;

		fragmentOptions = {
			descriptor: section.descriptor.f,
			root:       section.root,
			pNode:      section.parentFragment.pNode,
			owner:      section,
			indexRef:   section.descriptor.i
		};

		for ( i = start; i < end; i += 1 ) {
			fragmentOptions.context = section.keypath + '.' + i;
			fragmentOptions.index = i;

			section.fragments[i] = section.createFragment( fragmentOptions );
		}

		// Figure out where these new nodes need to be inserted
		insertionPoint = ( section.fragments[ end ] ? section.fragments[ end ].firstNode() : section.parentFragment.findNextNode( section ) );

		// Append docfrag in front of insertion point
		section.parentFragment.pNode.insertBefore( section.docFrag, insertionPoint );

		section.rendering = false;
	}

});
