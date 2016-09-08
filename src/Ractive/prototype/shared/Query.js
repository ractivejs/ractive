import runloop from '../../../global/runloop';
import { lastItem } from '../../../utils/array';
import { matches } from '../../../utils/dom';

function sortByDocumentPosition ( node, otherNode ) {
	if ( node.compareDocumentPosition ) {
		const bitmask = node.compareDocumentPosition( otherNode );
		return ( bitmask & 2 ) ? 1 : -1;
	}

	// In old IE, we can piggy back on the mechanism for
	// comparing component positions
	return sortByItemPosition( node, otherNode );
}

function sortByItemPosition ( a, b ) {
	const baseA = a.component || a._ractive.proxy;
	const baseB = b.component || b._ractive.proxy;

	// allow for attached childdren outside the template
	if ( baseA.target === false && baseB.target === false ) return 0;
	else if ( baseA.target === false ) return 1;
	else if ( baseB.target === false ) return -1;

	const ancestryA = getAncestry( baseA );
	const ancestryB = getAncestry( baseB );

	let oldestA = lastItem( ancestryA );
	let oldestB = lastItem( ancestryB );
	let mutualAncestor;

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

	const fragmentA = oldestA.parentFragment;
	const fragmentB = oldestB.parentFragment;

	// if both items share a parent fragment, our job is easy
	if ( fragmentA === fragmentB ) {
		const indexA = fragmentA.items.indexOf( oldestA );
		const indexB = fragmentB.items.indexOf( oldestB );

		// if it's the same index, it means one contains the other,
		// so we see which has the longest ancestry
		return ( indexA - indexB ) || ancestryA.length - ancestryB.length;
	}

	// if mutual ancestor is a section, we first test to see which section
	// fragment comes first
	const fragments = mutualAncestor.iterations;
	if ( fragments ) {
		const indexA = fragments.indexOf( fragmentA );
		const indexB = fragments.indexOf( fragmentB );

		return ( indexA - indexB ) || ancestryA.length - ancestryB.length;
	}

	throw new Error( 'An unexpected condition was met while comparing the position of two components. Please file an issue at https://github.com/ractivejs/ractive/issues - thanks!' );
}

function getParent ( item ) {
	let parentFragment = item.parentFragment;

	if ( parentFragment ) return parentFragment.owner;

	if ( item.component && ( parentFragment = item.component.parentFragment ) ) {
		return parentFragment.owner;
	}
}

function getAncestry ( item ) {
	let ancestry = [ item ];
	let ancestor = getParent( item );

	while ( ancestor ) {
		ancestry.push( ancestor );
		ancestor = getParent( ancestor );
	}

	return ancestry;
}


export default class Query {
	constructor ( ractive, selector, live, isComponentQuery ) {
		this.ractive = ractive;
		this.selector = selector;
		this.live = live;
		this.isComponentQuery = isComponentQuery;

		this.refs = 1;

		this.result = [];
		this.result.cancel = () => this.cancel();

		this.dirty = true;
	}

	add ( item ) {
		this.result.push( item );
		this.makeDirty();
	}

	cancel () {
		if ( --this.refs ) return;

		this.cancelled = true;

		let liveQueries = this.ractive[ this.isComponentQuery ? '_liveComponentQueries' : '_liveQueries' ];

		const index = liveQueries.indexOf( this );

		if ( index !== -1 ) {
			liveQueries.splice( index, 1 );
		}

		this.result.forEach( item => {
			item = this.isComponentQuery ? item.component : item._ractive.proxy;
			item.removeFromQuery( this );
		});
	}

	init () {
		this.dirty = false;
	}

	makeDirty () {
		if ( !this.dirty ) {
			this.dirty = true;

			// Once the DOM has been updated, ensure the query
			// is correctly ordered
			runloop.scheduleTask( () => this.update() );
		}
	}

	remove ( item ) {
		if ( !this.cancelled ) {
			const index = this.result.indexOf( item );
			if ( index !== -1 ) this.result.splice( index, 1 );
		}
	}

	update () {
		this.result.sort( this.isComponentQuery ? sortByItemPosition : sortByDocumentPosition );
		this.dirty = false;
	}

	test ( item ) {
		return this.isComponentQuery ?
			( !this.selector || item.name === this.selector ) :
			( item ? matches( item, this.selector ) : null );
	}
}
