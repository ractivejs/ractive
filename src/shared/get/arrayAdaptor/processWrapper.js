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
		var root, keypath, clearEnd, updateDependant, i, changed, start, end, childKeypath, lengthUnchanged;

		root = wrapper.root;
		keypath = wrapper.keypath;

		root._changes.push( keypath );

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

		// Propagate changes
		updateDependant = function ( dependant ) {
			// is this a DOM section?
			if ( dependant.keypath === keypath && dependant.type === types.SECTION && !dependant.inverted && dependant.docFrag ) {
				dependant.splice( spliceSummary );
			} else {
				dependant.update();
			}
		};

		// Go through all dependant priority levels, finding smart update targets
		root._deps.forEach( function ( depsByKeypath ) {
			var dependants = depsByKeypath[ keypath ];

			if ( dependants ) {
				dependants.forEach( updateDependant );
			}
		});

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

});
