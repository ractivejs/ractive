import addEventProxy from 'parallel-dom/items/Element/prototype/init/addEventProxy';

export default function ( element, proxies ) {
	var i, eventName, eventNames;

	for ( eventName in proxies ) {
		if ( proxies.hasOwnProperty( eventName ) ) {
			eventNames = eventName.split( '-' );
			i = eventNames.length;

			while ( i-- ) {
				addEventProxy( element, eventNames[i], proxies[ eventName ] );
			}
		}
	}
}
