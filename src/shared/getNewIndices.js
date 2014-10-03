// This function takes an array, the name of a mutator method, and the
// arguments to call that mutator method with, and returns an array that
// maps the old indices to their new indices.

// So if you had something like this...
//
//     array = [ 'a', 'b', 'c', 'd' ];
//     array.push( 'e' );
//
// ...you'd get `[ 0, 1, 2, 3 ]` - in other words, none of the old indices
// have changed. If you then did this...
//
//     array.unshift( 'z' );
//
// ...the indices would be `[ 1, 2, 3, 4, 5 ]` - every item has been moved
// one higher to make room for the 'z'. If you removed an item, the new index
// would be -1...
//
//     array.splice( 2, 2 );
//
// ...this would result in [ 0, 1, -1, -1, 2, 3 ].
//
// This information is used to enable fast, non-destructive shuffling of list
// sections when you do e.g. `ractive.splice( 'items', 2, 2 );

export default function getNewIndices ( array, methodName, args ) {
	var spliceArguments, len, newIndices = [], removeStart, removeEnd, balance, i;

	spliceArguments = getSpliceEquivalent( array, methodName, args );

	if ( !spliceArguments ) {
		return null; // TODO support reverse and sort?
	}

	len = array.length;
	balance = ( spliceArguments.length - 2 ) - spliceArguments[1];

	removeStart = Math.min( len, spliceArguments[0] );
	removeEnd = removeStart + spliceArguments[1];

	for ( i = 0; i < removeStart; i += 1 ) {
		newIndices.push( i );
	}

	for ( ; i < removeEnd; i += 1 ) {
		newIndices.push( -1 );
	}

	for ( ; i < len; i += 1 ) {
		newIndices.push( i + balance );
	}

	return newIndices;
}


// The pop, push, shift an unshift methods can all be represented
// as an equivalent splice
function getSpliceEquivalent ( array, methodName, args ) {
	switch ( methodName ) {
		case 'splice':
			if ( args[0] !== undefined && args[0] < 0 ) {
				args[0] = array.length + Math.max( args[0], -array.length );
			}

			while ( args.length < 2 ) {
				args.push( 0 );
			}

			// ensure we only remove elements that exist
			args[1] = Math.min( args[1], array.length - args[0] );

			return args;

		case 'sort':
		case 'reverse':
			return null;

		case 'pop':
			if ( array.length ) {
				return [ array.length - 1, 1 ];
			}
			return null;

		case 'push':
			return [ array.length, 0 ].concat( args );

		case 'shift':
			return [ 0, 1 ];

		case 'unshift':
			return [ 0, 0 ].concat( args );
	}
}