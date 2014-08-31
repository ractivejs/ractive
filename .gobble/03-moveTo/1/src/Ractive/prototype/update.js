define(['Ractive/prototype/shared/fireEvent','global/runloop'],function (fireEvent, runloop) {

	'use strict';
	
	return function Ractive$update ( keypath, callback ) {
		var promise;
	
		if ( typeof keypath === 'function' ) {
			callback = keypath;
			keypath = '';
		} else {
			keypath = keypath || '';
		}
	
		promise = runloop.start( this, true );
	
		this.viewmodel.mark( keypath );
		runloop.end();
	
		fireEvent( this, 'update', { args: [ keypath ] });
	
		if ( callback ) {
			promise.then( callback.bind( this ) );
		}
	
		return promise;
	};

});