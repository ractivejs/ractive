define([
	'utils/isArray',
	'shared/clearCache',
	'shared/processDeferredUpdates',
	'shared/makeTransitionManager',
	'shared/notifyDependants',
	'Ractive/prototype/shared/replaceData',
	'Ractive/prototype/merge/mapOldToNewIndex',
	'Ractive/prototype/merge/queueDependants'
], function (
	isArray,
	clearCache,
	processDeferredUpdates,
	makeTransitionManager,
	notifyDependants,
	replaceData,
	mapOldToNewIndex,
	queueDependants
) {
	
	'use strict';

	return function ( keypath, array, sameSameButDifferent, complete ) {

		var oldArray,
			newArray,
			lengthUnchanged,
			i,
			newIndices,
			mergeQueue,
			updateQueue,
			depsByKeypath,
			deps,
			transitionManager,
			previousTransitionManager,
			upstreamQueue,
			keys;

		oldArray = this.get( keypath );

		// If either the existing value or the new value isn't an
		// array, just do a regular set
		if ( !isArray( oldArray ) || !isArray( array ) ) {
			return this.set( keypath, array ); // TODO complete handler?
		}

		lengthUnchanged = ( oldArray.length === array.length );

		// if we're dealing with objects that look identical but aren't
		// - i.e. {foo:'bar'} !== {foo:'bar'} - the easiest thing to do is
		// stringify them in order to compare
		if ( sameSameButDifferent ) {
			oldArray = oldArray.map( stringify );
			newArray = array.map( stringify );
		} else {
			newArray = array;
		}


		// find new indices for members of oldArray
		newIndices = mapOldToNewIndex( oldArray, newArray );



		// Clear the cache
		clearCache( this, keypath );

		// Update the model
		// TODO allow existing array to be updated in place, rather than replaced?
		replaceData( this, keypath, array );

		if ( newIndices.unchanged && lengthUnchanged ) {
			// noop - but we still needed to replace the data
			return;
		}


		// Manage transitions
		previousTransitionManager = this._transitionManager;
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// Go through all dependant priority levels, finding merge targets
		mergeQueue = [];
		updateQueue = [];

		for ( i=0; i<this._deps.length; i+=1 ) { // we can't cache this._deps.length as it may change!
			depsByKeypath = this._deps[i];

			if ( !depsByKeypath ) {
				continue;
			}

			deps = depsByKeypath[ keypath ];
			
			if ( deps ) {
				queueDependants( keypath, deps, mergeQueue, updateQueue );

				// we may have some deferred evaluators to process
				processDeferredUpdates( this );

				while ( mergeQueue.length ) {
					mergeQueue.pop().merge( newIndices );
				}

				while ( updateQueue.length ) {
					updateQueue.pop().update();
				}
			}
		}

		processDeferredUpdates( this );

		// Finally, notify direct dependants of upstream keypaths...
		upstreamQueue = [];

		keys = keypath.split( '.' );
		while ( keys.length ) {
			keys.pop();
			upstreamQueue[ upstreamQueue.length ] = keys.join( '.' );
		}

		notifyDependants.multiple( this, upstreamQueue, true );

		// length property has changed - notify dependants
		// TODO in some cases (e.g. todo list example, when marking all as complete, then
		// adding a new item (which should deactivate the 'all complete' checkbox
		// but doesn't) this needs to happen before other updates. But doing so causes
		// other mental problems. not sure what's going on...
		if ( oldArray.length !== newArray.length ) {
			notifyDependants( this, keypath + '.length', true );
		}



		// transition manager has finished its work
		this._transitionManager = previousTransitionManager;
		transitionManager.ready();
	};

	function stringify ( item ) {
		return JSON.stringify( item );
	}

});