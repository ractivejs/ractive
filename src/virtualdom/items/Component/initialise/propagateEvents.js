import warn from 'utils/warn';
import errors from 'config/errors';

// TODO how should event arguments be handled? e.g.
// <widget on-foo='bar:1,2,3'/>
// The event 'bar' will be fired on the parent instance
// when 'foo' fires on the child, but the 1,2,3 arguments
// will be lost

export default function ( component, eventsDescriptor ) {
	var eventName;

	for ( eventName in eventsDescriptor ) {
		if ( eventsDescriptor.hasOwnProperty( eventName ) ) {
			propagateEvent( component.instance, component.root, eventName, eventsDescriptor[ eventName ] );
		}
	}
}

function propagateEvent ( childInstance, parentInstance, eventName, proxyEventName ) {
	if ( typeof proxyEventName !== 'string' ) {

		if ( parentInstance.isDebug() ) {
			throw new Error( errors.noComponentEventArguments );
		} else {
			warn( errors.noComponentEventArguments );
			return;
		}
	}

	childInstance.on( eventName, function () {
		var args = Array.prototype.slice.call( arguments );
		args.unshift( proxyEventName );

		parentInstance.fire.apply( parentInstance, args );
	});
}
