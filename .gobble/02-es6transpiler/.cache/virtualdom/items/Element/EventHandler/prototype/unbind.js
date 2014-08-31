define(function () {

	'use strict';
	
	var __export;
	
	__export = function EventHandler$unbind () {
		if ( this.method ) {
			this.unresolved.forEach( teardown );
			return;
		}
	
		// Tear down dynamic name
		if ( typeof this.action !== 'string' ) {
			this.action.unbind();
		}
	
		// Tear down dynamic parameters
		if ( this.dynamicParams ) {
			this.dynamicParams.unbind();
		}
	};
	
	function teardown ( x ) {
		x.teardown();
	}
	return __export;

});