define(['global/runloop','utils/isObject','utils/normaliseKeypath','shared/getMatchingKeypaths'],function (runloop, isObject, normaliseKeypath, getMatchingKeypaths) {

	'use strict';
	
	var wildcard = /\*/;
	
	return function Ractive$set ( keypath, value, callback ) {var this$0 = this;
		var map, promise;
	
		promise = runloop.start( this, true );
	
		// Set multiple keypaths in one go
		if ( isObject( keypath ) ) {
			map = keypath;
			callback = value;
	
			for ( keypath in map ) {
				if ( map.hasOwnProperty( keypath) ) {
					value = map[ keypath ];
					keypath = normaliseKeypath( keypath );
	
					this.viewmodel.set( keypath, value );
				}
			}
		}
	
		// Set a single keypath
		else {
			keypath = normaliseKeypath( keypath );
	
			if ( wildcard.test( keypath ) ) {
				getMatchingKeypaths( this, keypath ).forEach( function(keypath ) {
					this$0.viewmodel.set( keypath, value );
				});
			} else {
				this.viewmodel.set( keypath, value );
			}
		}
	
		runloop.end();
	
		if ( callback ) {
			promise.then( callback.bind( this ) );
		}
	
		return promise;
	};

});