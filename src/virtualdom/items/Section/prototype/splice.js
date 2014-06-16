import runloop from 'global/runloop';
import circular from 'circular';

var Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function ( spliceSummary ) {
	var section = this, balance, start, insertStart, insertEnd, spliceArgs;

	balance = spliceSummary.balance;

	if ( !balance ) {
		// The array length hasn't changed - we don't need to add or remove anything
		return;
	}

	// Register with the runloop, so we can (un)render with the
	// next batch of DOM changes
	runloop.addView( section );

	start = spliceSummary.rangeStart;
	section.length += balance;

	// If more items were removed from the array than added, we tear down
	// the excess fragments and remove them...
	if ( balance < 0 ) {
		section.fragmentsToRemove = section.fragments.splice( start, -balance );
		section.fragmentsToRemove.forEach( teardown );

		// Reassign fragments after the ones we've just removed
		rebindFragments( section, start, section.length, balance );

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
	rebindFragments( section, insertEnd, section.length, balance );

	// Create the new ones
	renderNewFragments( section, insertStart, insertEnd );
}

function teardown ( fragment ) {
	fragment.teardown();
}

function renderNewFragments ( section, start, end ) {
	var fragmentOptions, fragment, i;

	fragmentOptions = {
		template: section.template.f,
		root:       section.root,
		pElement:   section.pElement,
		owner:      section,
		indexRef:   section.template.i
	};

	for ( i = start; i < end; i += 1 ) {
		fragmentOptions.context = section.keypath + '.' + i;
		fragmentOptions.index = i;

		fragment = new Fragment( fragmentOptions );
		section.fragmentsToAdd.push( section.fragments[i] = fragment );
	}

	// Figure out where these new nodes need to be inserted
	// TODO something feels off about this?
	section.insertionPoint = ( section.fragments[ end ] ? section.fragments[ end ].firstNode() : section.parentFragment.findNextNode( section ) );
}

function rebindFragments ( section, start, end, by ) {

	var i, fragment, indexRef, oldKeypath, newKeypath;

	indexRef = section.template.i;

	for ( i = start; i < end; i += 1 ) {
		fragment = section.fragments[i];

		oldKeypath = section.keypath + '.' + ( i - by );
		newKeypath = section.keypath + '.' + i;

		// change the fragment index
		fragment.index = i;
		fragment.rebind( indexRef, i, oldKeypath, newKeypath );
	}
}

