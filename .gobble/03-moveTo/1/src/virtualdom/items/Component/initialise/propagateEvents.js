define(['circular','Ractive/prototype/shared/fireEvent','utils/log'],function (circular, fireEvent, log) {

	'use strict';
	
	var __export;
	
	var Fragment;
	
	circular.push( function () {
		Fragment = circular.Fragment;
	});
	
	__export = function propagateEvents ( component, eventsDescriptor ) {
		var eventName;
	
		for ( eventName in eventsDescriptor ) {
			if ( eventsDescriptor.hasOwnProperty( eventName ) ) {
				propagateEvent( component.instance, component.root, eventName, eventsDescriptor[ eventName ] );
			}
		}
	};
	
	function propagateEvent ( childInstance, parentInstance, eventName, proxyEventName ) {
	
		if ( typeof proxyEventName !== 'string' ) {
			log.error({
				debug: parentInstance.debug,
				message: 'noComponentEventArguments'
			});
		}
	
		childInstance.on( eventName, function () {
			var options;
	
			// semi-weak test, but what else? tag the event obj ._isEvent ?
			if ( arguments[0].node ) {
				options = {
					event: Array.prototype.shift.call( arguments ),
					args: arguments
				};
			}
			else {
				options = {
					args: Array.prototype.slice.call( arguments )
				};
			}
	
			fireEvent( parentInstance, proxyEventName, options );
	
			// cancel bubbling
			return false;
		});
	}
	return __export;

});