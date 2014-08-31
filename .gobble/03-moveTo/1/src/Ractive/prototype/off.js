define(['Ractive/prototype/shared/trim','Ractive/prototype/shared/notEmptyString'],function (trim, notEmptyString) {

	'use strict';
	
	return function Ractive$off ( eventName, callback ) {var this$0 = this;
		var eventNames;
	
		// if no arguments specified, remove all callbacks
		if ( !eventName ) {
			// TODO use this code instead, once the following issue has been resolved
			// in PhantomJS (tests are unpassable otherwise!)
			// https://github.com/ariya/phantomjs/issues/11856
			// defineProperty( this, '_subs', { value: create( null ), configurable: true });
			for ( eventName in this._subs ) {
				delete this._subs[ eventName ];
			}
		}
	
		else {
			// Handle multiple space-separated event names
			eventNames = eventName.split( ' ' ).map( trim ).filter( notEmptyString );
	
			eventNames.forEach( function(eventName ) {
				var subscribers, index;
	
				// If we have subscribers for this event...
				if ( subscribers = this$0._subs[ eventName ] ) {
					// ...if a callback was specified, only remove that
					if ( callback ) {
						index = subscribers.indexOf( callback );
						if ( index !== -1 ) {
							subscribers.splice( index, 1 );
						}
					}
	
					// ...otherwise remove all callbacks
					else {
						this$0._subs[ eventName ] = [];
					}
				}
			});
		}
	
		return this;
	};

});