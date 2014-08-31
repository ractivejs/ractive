define(['virtualdom/items/shared/unbind'],function (unbind) {

	'use strict';
	
	var __export;
	
	__export = function Section$unbind () {
		this.fragments.forEach( unbindFragment );
		unbind.call( this );
	
		this.length = 0;
		this.unbound = true;
	};
	
	function unbindFragment ( fragment ) {
		fragment.unbind();
	}
	return __export;

});