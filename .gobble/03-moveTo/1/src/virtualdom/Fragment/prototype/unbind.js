define(function () {

	'use strict';
	
	var __export;
	
	__export = function Fragment$unbind () {
		this.items.forEach( unbindItem );
	};
	
	function unbindItem ( item ) {
		if ( item.unbind ) {
			item.unbind();
		}
	}
	return __export;

});