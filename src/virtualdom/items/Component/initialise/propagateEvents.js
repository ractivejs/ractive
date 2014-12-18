import fireEvent from 'Ractive/prototype/shared/fireEvent';
import { warn } from 'utils/log';

// TODO how should event arguments be handled? e.g.
// <widget on-foo='bar:1,2,3'/>
// The event 'bar' will be fired on the parent instance
// when 'foo' fires on the child, but the 1,2,3 arguments
// will be lost

export default function propagateEvents ( component, eventsDescriptor ) {
	var eventName;

	for ( eventName in eventsDescriptor ) {
		if ( eventsDescriptor.hasOwnProperty( eventName ) ) {
			propagateEvent( component.instance, component.root, eventName, eventsDescriptor[ eventName ] );
		}
	}
}

function propagateEvent ( childInstance, parentInstance, eventName, proxyEventName ) {
	if ( typeof proxyEventName !== 'string' ) {
		warn( 'Components currently only support simple events - you cannot include arguments. Sorry!' );
	}

	childInstance.on( eventName, function () {
		var event, args;

		// semi-weak test, but what else? tag the event obj ._isEvent ?
		if ( arguments.length && arguments[0] && arguments[0].node ) {
			event = Array.prototype.shift.call( arguments );
		}

		args = Array.prototype.slice.call( arguments );

		fireEvent( parentInstance, proxyEventName, { event: event, args: args } );

		// cancel bubbling
		return false;
	});
}
