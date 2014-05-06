// This function summarises a splice operation, as returned from
// getSpliceEquivalent()

export default function ( array, args ) {
    var rangeStart, rangeEnd, clearEnd, newLength, addedItems, removedItems, balance;

    if ( !args ) {
        return null;
    }

    // figure out where the changes started...
    rangeStart = +( args[0] < 0 ? array.length + args[0] : args[0] );

    // ...and how many items were added to or removed from the array
    addedItems = Math.max( 0, args.length - 2 );
    removedItems = ( args[1] !== undefined ? args[1] : array.length - rangeStart );

    // It's possible to do e.g. [ 1, 2, 3 ].splice( 2, 2 ) - i.e. the second argument
    // means removing more items from the end of the array than there are. In these
    // cases we need to curb JavaScript's enthusiasm or we'll get out of sync
    removedItems = Math.min( removedItems, array.length - rangeStart );

    balance = addedItems - removedItems;
    newLength = array.length + balance;

    // We need to find the end of the range affected by the splice, and the last
    // item that could already be cached (and therefore needs clearing)
    if ( !balance ) {
        // nice and easy
        rangeEnd = clearEnd = rangeStart + addedItems;
    } else {
        // bit more complicated. rangeEnd is the *greater* of the
        // old length and the new length
        rangeEnd = Math.max( array.length, newLength );

        // clearEnd is the *lesser* of those two values (since the
        // difference between them could not have previously been cached)
        clearEnd = Math.max( array.length, newLength );
    }

    return {
        rangeStart: rangeStart,
        rangeEnd: rangeEnd,
        clearEnd: clearEnd,
        balance: balance,
        added: addedItems,
        removed: removedItems
    };
};
