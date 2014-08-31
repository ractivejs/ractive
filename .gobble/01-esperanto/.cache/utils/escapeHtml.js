define(function () {

	'use strict';
	
	var lessThan = /</g, greaterThan = />/g;
	
	return function escapeHtml ( str ) {
		return str
			.replace( lessThan, '&lt;' )
			.replace( greaterThan, '&gt;' );
	};

});