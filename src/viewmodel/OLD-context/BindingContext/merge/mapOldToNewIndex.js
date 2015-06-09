export default function ( { oldArray, newArray } ) {

	const usedIndices = {},
		  oldLength = oldArray.length;

	let firstUnusedIndex = 0;

	return newArray.map( function ( item, i ) {
		let index, start = firstUnusedIndex;

		do {
			index = oldArray.indexOf( item, start );

			if ( index === -1 ) {
				return -1;
			}

			start = index + 1;
		} while ( ( usedIndices[ index ] === true ) && start < oldLength );

		// keep track of the first unused index, so we don't search
		// the whole of oldArray for each item in newArray unnecessarily
		if ( index === firstUnusedIndex ) {
			firstUnusedIndex += 1;
		}
		// allow next instance of next "equal" to be found item
		usedIndices[ index ] = true;
		return index;
	});
}
