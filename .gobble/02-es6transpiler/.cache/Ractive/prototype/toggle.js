define(['utils/log'],function (log) {

	'use strict';
	
	return function Ractive$toggle ( keypath, callback ) {
		var value;
	
		if ( typeof keypath !== 'string' ) {
	
			log.errorOnly({
				debug: this.debug,
				messsage: 'badArguments',
				arg: { arguments: keypath }
			});
		}
	
		value = this.get( keypath );
		return this.set( keypath, !value, callback );
	};

});