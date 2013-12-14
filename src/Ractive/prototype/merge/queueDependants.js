define([
	'config/types'
], function (
	types
) {
	
	'use strict';

	return function queueDependants ( keypath, deps, mergeQueue, updateQueue ) {
		var i, dependant;

		i = deps.length;
		while ( i-- ) {
			dependant = deps[i];

			// references need to get processed before mustaches
			if ( dependant.type === types.REFERENCE ) {
				dependant.update();
			}

			// is this a DOM section?
			else if ( dependant.keypath === keypath && dependant.type === types.SECTION && !dependant.inverted && dependant.pNode ) {
				mergeQueue[ mergeQueue.length ] = dependant;

			} else {
				updateQueue[ updateQueue.length ] = dependant;
			}
		}
	};

});