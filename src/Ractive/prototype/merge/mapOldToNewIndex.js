define([], function () {
	
	'use strict';

	return function ( oldArray, newArray ) {
		var usedIndices, mapper, firstUnusedIndex, newIndices, changed;

		usedIndices = {};
		firstUnusedIndex = 0;

		mapper = function ( item, i ) {
			var index, start, len;

			start = firstUnusedIndex;
			len = newArray.length;

			do {
				index = newArray.indexOf( item, start );

				if ( index === -1 ) {
					return -1;
				}

				start = index + 1;
			} while ( usedIndices[ index ] && start < len );

			// keep track of the first unused index, so we don't search
			// the whole of newArray for each item in oldArray unnecessarily
			if ( index === firstUnusedIndex ) {
				firstUnusedIndex += 1;
			}

			if ( index !== i ) {
				changed = true;
			}

			usedIndices[ index ] = true;
			return index;
		};

		newIndices = oldArray.map( mapper );
		newIndices.unchanged = !changed;

		return newIndices;
	};

});