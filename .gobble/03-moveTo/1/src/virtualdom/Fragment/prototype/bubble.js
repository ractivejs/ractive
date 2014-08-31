define(function () {

	'use strict';
	
	return function Fragment$bubble () {
		this.dirtyValue = this.dirtyArgs = true;
	
		if ( this.inited && typeof this.owner.bubble === 'function' ) {
			this.owner.bubble();
		}
	};

});