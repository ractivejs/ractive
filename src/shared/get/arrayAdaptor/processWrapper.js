define([
	'config/types',
	'shared/clearCache',
	'shared/notifyDependants',
	'shared/set'
], function (
	types,
	clearCache,
	notifyDependants,
	set
) {

	'use strict';

	return function ( wrapper, array, methodName, spliceSummary ) {
		var root, keypath, depsByKeypath, deps, clearEnd, smartUpdateQueue, dumbUpdateQueue, i, changed, start, end, childKeypath, lengthUnchanged;

		root = wrapper.root;
		keypath = wrapper.keypath;

		// If this is a sort or reverse, we just do root.set()...
		// TODO use merge logic?
		if ( methodName === 'sort' || methodName === 'reverse' ) {
			set( root, keypath, array );
			return;
		}

		if ( !spliceSummary ) {
			// (presumably we tried to pop from an array of zero length.
			// in which case there's nothing to do)
			return;
		}

		// ...otherwise we do a smart update whereby elements are added/removed
		// in the right place. But we do need to clear the cache downstream
		clearEnd = ( !spliceSummary.balance ? spliceSummary.added : array.length - Math.min( spliceSummary.balance, 0 ) );
		for ( i = spliceSummary.start; i < clearEnd; i += 1 ) {
			clearCache( root, keypath + '.' + i );
		}

		// Find dependants. If any are DOM sections, we do a smart update
		// rather than a ractive.set() blunderbuss
		smartUpdateQueue = [];
		dumbUpdateQueue = [];

		for ( i=0; i<root._deps.length; i+=1 ) { // we can't cache root._deps.length as it may change!
			depsByKeypath = root._deps[i];

			if ( !depsByKeypath ) {
				continue;
			}

			deps = depsByKeypath[ keypath ];

			if ( deps ) {
				queueDependants( keypath, deps, smartUpdateQueue, dumbUpdateQueue );

				while ( smartUpdateQueue.length ) {
					smartUpdateQueue.pop().smartUpdate( methodName, spliceSummary );
				}

				while ( dumbUpdateQueue.length ) {
					dumbUpdateQueue.pop().update();
				}
			}
		}

		// if we're removing old items and adding new ones, simultaneously, we need to force an update
		if ( spliceSummary.added && spliceSummary.removed ) {
			changed = Math.max( spliceSummary.added, spliceSummary.removed );
			start = spliceSummary.start;
			end = start + changed;

			lengthUnchanged = spliceSummary.added === spliceSummary.removed;

			for ( i=start; i<end; i+=1 ) {
				childKeypath = keypath + '.' + i;
				notifyDependants( root, childKeypath );
			}
		}

		// length property has changed - notify dependants
		// TODO in some cases (e.g. todo list example, when marking all as complete, then
		// adding a new item (which should deactivate the 'all complete' checkbox
		// but doesn't) this needs to happen before other updates. But doing so causes
		// other mental problems. not sure what's going on...
		if ( !lengthUnchanged ) {
			clearCache( root, keypath + '.length' );
			notifyDependants( root, keypath + '.length', true );
		}
	};

	// TODO can we get rid of this whole queueing nonsense?
	function queueDependants ( keypath, deps, smartUpdateQueue, dumbUpdateQueue ) {
		var k, dependant;

		k = deps.length;
		while ( k-- ) {
			dependant = deps[k];

			// references need to get processed before mustaches
			if ( dependant.type === types.REFERENCE ) {
				dependant.update();
			}

			// is this a DOM section?
			else if ( dependant.keypath === keypath && dependant.type === types.SECTION && !dependant.inverted && dependant.docFrag ) {
				smartUpdateQueue.push( dependant );

			} else {
				dumbUpdateQueue.push( dependant );
			}
		}
	}

});
