define([
	'utils/toArray'
], function (
	toArray
) {

	'use strict';

	return function getMatchingStaticNodes ( element, selector ) {
		if ( !element.matchingStaticNodes[ selector ] ) {
			element.matchingStaticNodes[ selector ] = toArray( element.node.querySelectorAll( selector ) );
		}

		return element.matchingStaticNodes[ selector ];
	};

});
