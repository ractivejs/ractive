define(function () {

	'use strict';
	
	return function Section$findAllComponents ( selector, query ) {
		var i, len;
	
		len = this.fragments.length;
		for ( i = 0; i < len; i += 1 ) {
			this.fragments[i].findAllComponents( selector, query );
		}
	};

});