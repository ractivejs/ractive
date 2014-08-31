define(function () {

	'use strict';
	
	return function Component$findNextNode () {
		return this.parentFragment.findNextNode( this );
	};

});