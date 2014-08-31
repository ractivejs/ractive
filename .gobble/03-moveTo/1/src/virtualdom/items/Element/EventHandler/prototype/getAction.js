define(function () {

	'use strict';
	
	return function EventHandler$getAction () {
		return this.action.toString().trim();
	};

});