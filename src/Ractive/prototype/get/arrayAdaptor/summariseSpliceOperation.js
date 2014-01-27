define([

], function (

) {

	'use strict';

	// This function summarises a splice operation, as returned from
	// getSpliceEquivalent()

	return function ( array, args ) {
		var start, addedItems, removedItems, balance;

		if ( !args ) {
			return null;
		}

		// figure out where the changes started...
		start = +( args[0] < 0 ? array.length + args[0] : args[0] );

		// ...and how many items were added to or removed from the array
		addedItems = Math.max( 0, args.length - 2 );
		removedItems = ( args[1] !== undefined ? args[1] : array.length - start );

		// It's possible to do e.g. [ 1, 2, 3 ].splice( 2, 2 ) - i.e. the second argument
		// means removing more items from the end of the array than there are. In these
		// cases we need to curb JavaScript's enthusiasm or we'll get out of sync
		removedItems = Math.min( removedItems, array.length - start );

		balance = addedItems - removedItems;

		return {
			start: start,
			balance: balance,
			added: addedItems,
			removed: removedItems
		};
	};

});