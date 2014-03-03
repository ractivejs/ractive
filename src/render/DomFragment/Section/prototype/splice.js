define([
	'render/DomFragment/Section/reassignFragments'
], function (
	reassignFragments
) {

	'use strict';

	return function ( spliceSummary ) {
		var section = this, insertionPoint, balance, i, start, end, insertStart, insertEnd, spliceArgs, fragmentOptions;

		balance = spliceSummary.balance;

		if ( !balance ) {
			// The array length hasn't changed - we don't need to add or remove anything
			return;
		}

		section.rendering = true;
		start = spliceSummary.start;

		// If more items were removed than added, we need to remove some things from the DOM
		if ( balance < 0 ) {
			end = start - balance;

			for ( i=start; i<end; i+=1 ) {
				section.fragments[i].teardown( true );
			}

			// Keep in sync
			section.fragments.splice( start, -balance );
		}

		// Otherwise we need to add some things to the DOM
		else {
			fragmentOptions = {
				descriptor: section.descriptor.f,
				root:       section.root,
				pNode:      section.parentFragment.pNode,
				owner:      section
			};

			if ( section.descriptor.i ) {
				fragmentOptions.indexRef = section.descriptor.i;
			}

			insertStart = start + spliceSummary.removed;
			insertEnd = start + spliceSummary.added;

			// Figure out where these new nodes need to be inserted
			insertionPoint = ( section.fragments[ insertStart ] ? section.fragments[ insertStart ].firstNode() : section.parentFragment.findNextNode( section ) );

			// Make room for the new fragments. (Just trust me, this works...)
			spliceArgs = [ insertStart, 0 ].concat( new Array( balance ) );
			section.fragments.splice.apply( section.fragments, spliceArgs );

			for ( i=insertStart; i<insertEnd; i+=1 ) {
				fragmentOptions.context = section.keypath + '.' + i;
				fragmentOptions.index = i;

				section.fragments[i] = section.createFragment( fragmentOptions );
			}

			// Append docfrag in front of insertion point
			section.parentFragment.pNode.insertBefore( section.docFrag, insertionPoint );
		}

		section.length += balance;


		// Now we need to reassign existing fragments (e.g. items.4 -> items.3 - the keypaths,
		// context stacks and index refs will have changed)
		reassignFragments( section, start, section.length, balance );
		section.rendering = false;
	};

});
