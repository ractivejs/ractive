define(function () {

	'use strict';
	
	var __export;
	
	__export = function Section$unrender ( shouldDestroy ) {
		this.fragments.forEach( shouldDestroy ? unrenderAndDestroy : unrender );
	};
	
	function unrenderAndDestroy ( fragment ) {
		fragment.unrender( true );
	}
	
	function unrender ( fragment ) {
		fragment.unrender( false );
	}
	return __export;

});