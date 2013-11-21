define([

], function (

) {
	
	'use strict';

	return function ( oldArray, newArray ) {
		var usedIndices, mapper, firstUnusedIndex;

		usedIndices = {};
		firstUnusedIndex = 0;

		mapper = function ( item ) {
			var index, start, len;

			start = firstUnusedIndex;
			len = newArray.length;

			do {
				index = newArray.indexOf( item, start );

				if ( index === -1 ) {
					return -1;
				}

				start = index + 1;
			} while ( usedIndices[ index ] && start < len )

			// keep track of the first unused index, so we don't search
			// the whole of newArray for each item in oldArray unnecessarily
			if ( index === firstUnusedIndex ) {
				firstUnusedIndex += 1;
			}

			usedIndices[ index ] = true;
			return index;
		};

		return oldArray.map( mapper );
	};

});