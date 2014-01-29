define( function () {

	'use strict';

	return function ( selector ) {
		if ( this.fragment ) {
			return this.fragment.findComponent( selector );
		}
	};

});
