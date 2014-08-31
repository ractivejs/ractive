define(function () {

	'use strict';
	
	return function findParentSelect ( element ) {
		do {
			if ( element.name === 'select' ) {
				return element;
			}
		} while ( element = element.parent );
	};

});