import { lastItem } from 'utils/array';

export default function ( a, b ) {
	var ancestryA, ancestryB, oldestA, oldestB, mutualAncestor, indexA, indexB, fragments, fragmentA, fragmentB;

	ancestryA = getAncestry( a.component || a._ractive.proxy );
	ancestryB = getAncestry( b.component || b._ractive.proxy );

	oldestA = lastItem( ancestryA );
	oldestB = lastItem( ancestryB );

	// remove items from the end of both ancestries as long as they are identical
	// - the final one removed is the closest mutual ancestor
	while ( oldestA && ( oldestA === oldestB ) ) {
		ancestryA.pop();
		ancestryB.pop();

		mutualAncestor = oldestA;

		oldestA = lastItem( ancestryA );
		oldestB = lastItem( ancestryB );
	}

	// now that we have the mutual ancestor, we can find which is earliest
	oldestA = oldestA.component || oldestA;
	oldestB = oldestB.component || oldestB;

	fragmentA = oldestA.parentFragment;
	fragmentB = oldestB.parentFragment;

	// if both items share a parent fragment, our job is easy
	if ( fragmentA === fragmentB ) {
		indexA = fragmentA.items.indexOf( oldestA );
		indexB = fragmentB.items.indexOf( oldestB );

		// if it's the same index, it means one contains the other,
		// so we see which has the longest ancestry
		return ( indexA - indexB ) || ancestryA.length - ancestryB.length;
	}

	// if mutual ancestor is a section, we first test to see which section
	// fragment comes first
	if ( fragments = mutualAncestor.fragments ) {
		indexA = fragments.indexOf( fragmentA );
		indexB = fragments.indexOf( fragmentB );

		return ( indexA - indexB ) || ancestryA.length - ancestryB.length;
	}

	throw new Error( 'An unexpected condition was met while comparing the position of two components. Please file an issue at https://github.com/RactiveJS/Ractive/issues - thanks!' );
}

function getParent ( item ) {
	var parentFragment;

	if ( parentFragment = item.parentFragment ) {
		return parentFragment.owner;
	}

	if ( item.component && ( parentFragment = item.component.parentFragment ) ) {
		return parentFragment.owner;
	}
}

function getAncestry ( item ) {
	var ancestry, ancestor;

	ancestry = [ item ];

	ancestor = getParent( item );

	while ( ancestor ) {
		ancestry.push( ancestor );
		ancestor = getParent( ancestor );
	}

	return ancestry;
}
