define(['utils/getPotentialWildcardMatches'],function (getPotentialWildcardMatches) {

	'use strict';
	
	var __export;
	
	__export = function fireEvent ( ractive, eventName ) {var options = arguments[2];if(options === void 0)options = {};
		if ( !eventName ) { return; }
		var eventNames = getPotentialWildcardMatches( eventName );
		fireEventAs( ractive, eventNames, options.event, options.args, true );
	};
	
	function fireEventAs  ( ractive, eventNames, event, args ) {var initialFire = arguments[4];if(initialFire === void 0)initialFire = false;
	
		var subscribers, i, bubble = true;
	
		for ( i = eventNames.length; i >= 0; i-- ) {
			subscribers = ractive._subs[ eventNames[ i ] ];
	
			if ( subscribers ) {
				bubble = notifySubscribers( ractive, subscribers, event, args ) && bubble;
			}
		}
	
		if ( ractive._parent && bubble ) {
	
			if ( initialFire && ractive.component ) {
				var fullName = ractive.component.name + '.' + eventNames[ eventNames.length-1 ];
				eventNames = getPotentialWildcardMatches( fullName );
	
				if( event ) {
					event.component = ractive;
				}
			}
	
			fireEventAs( ractive._parent, eventNames, event, args );
		}
	}
	
	function notifySubscribers ( ractive, subscribers, event, args ) {
	
		var originalEvent = null, stopEvent = false;
	
		if ( event ) {
			args = [ event ].concat( args );
		}
	
		for ( var i = 0, len = subscribers.length; i < len; i += 1 ) {
			if ( subscribers[ i ].apply( ractive, args ) === false ) {
				stopEvent = true;
			}
		}
	
		if ( event && stopEvent && ( originalEvent = event.original ) ) {
			originalEvent.preventDefault && originalEvent.preventDefault();
			originalEvent.stopPropagation && originalEvent.stopPropagation();
		}
	
		return !stopEvent;
	}
	return __export;

});