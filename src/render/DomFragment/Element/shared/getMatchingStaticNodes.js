define( function () {

	'use strict';

	return function getMatchingStaticNodes ( element, selector ) {
		if ( !element.matchingStaticNodes[ selector ] ) {
			element.matchingStaticNodes[ selector ] = Array.prototype.slice.call( element.node.querySelectorAll( selector ) );
		}

		return element.matchingStaticNodes[ selector ];
	};

});
