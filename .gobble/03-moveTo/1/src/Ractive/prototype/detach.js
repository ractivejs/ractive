define(['utils/removeFromArray'],function (removeFromArray) {

	'use strict';
	
	return function Ractive$detach () {
		if ( this.detached ) {
			return this.detached;
		}
	
		if ( this.el ) {
			removeFromArray( this.el.__ractive_instances__, this );
		}
	
		this.detached = this.fragment.detach();
		return this.detached;
	};

});