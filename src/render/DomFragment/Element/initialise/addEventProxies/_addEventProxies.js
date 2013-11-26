define([ 'render/DomFragment/Element/initialise/addEventProxies/addEventProxy' ], function ( addEventProxy ) {
	
	'use strict';

	return function ( element, proxies ) {
		var i, eventName, eventNames;

		for ( eventName in proxies ) {
			if ( proxies.hasOwnProperty( eventName ) ) {
				eventNames = eventName.split( '-' );
				i = eventNames.length;

				while ( i-- ) {
					addEventProxy( element, eventNames[i], proxies[ eventName ], element.parentFragment.contextStack );
				}
			}
		}
	};

});