define(['utils/normaliseKeypath'],function (normaliseKeypath) {

	'use strict';
	
	var options = { capture: true }; // top-level calls should be intercepted
	
	return function Ractive$get ( keypath ) {
		keypath = normaliseKeypath( keypath );
		return this.viewmodel.get( keypath, options );
	};

});