import runloop from 'global/runloop';
import circular from 'circular';

var Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function Section$splice ( spliceSummary ) {
	var section = this, balance, start, insertStart, insertEnd, spliceArgs;

	// In rare cases, a section will receive a splice instruction after it has
	// been unbound (see https://github.com/ractivejs/ractive/issues/967). This
	// prevents errors arising from those situations
	if ( this.unbound ) {
		return;
	}

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
		section.fragmentsToUnrender = section.fragments.splice( start, -balance );
		section.fragmentsToUnrender.forEach( unbind );

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

	// Rebind existing fragments at the end of the array
	rebindFragments( section, insertEnd, section.length, balance );

	// Schedule new fragments to be created
	section.fragmentsToCreate = range( insertStart, insertEnd );
}

function unbind ( fragment ) {
	fragment.unbind();
}

function range ( start, end ) {
	var array = [], i;

	for ( i = start; i < end; i += 1 ) {
		array.push( i );
	}

	return array;
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
