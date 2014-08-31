define(['virtualdom/items/Element/special/option/unbind'],function (unbindOption) {

	'use strict';
	
	var __export;
	
	__export = function Element$unbind () {
		if ( this.fragment ) {
			this.fragment.unbind();
		}
	
		if ( this.binding ) {
			this.binding.unbind();
		}
	
		if ( this.eventHandlers ) {
			this.eventHandlers.forEach( unbind );
		}
	
		// Special case - <option>
		if ( this.name === 'option' ) {
			unbindOption( this );
		}
	
		this.attributes.forEach( unbind );
	};
	
	function unbind ( x ) {
		x.unbind();
	}
	return __export;

});