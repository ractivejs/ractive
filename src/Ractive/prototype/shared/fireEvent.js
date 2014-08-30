export default function fireEvent ( ractive, eventName, options = {} ) {


	fireEventAs(
		ractive,
		[ eventName ],
		options.event,
		options.args,
		ractive.bubble,
		true
	);

}

function fireEventAs  ( ractive, eventNames, event, args, bubble, initialFire ) {

	if ( !ractive ) { return; }

	var subscribers, i;

	// eventNames has both the provided event name and potentially the namespaced event
	for ( i = 0; i < eventNames.length; i++ ) {
		subscribers = ractive._subs[ eventNames[ i ] ];

		if ( subscribers ) {
			bubble = notifySubscribers( ractive, subscribers, event, args ) && bubble;
		}
	}

	if ( ractive._parent && bubble ) {

		if ( initialFire && ractive.component ) {
			eventNames.push( ractive.component.name + eventNames[ 0 ] );
		}

		fireEventAs( ractive._parent, eventNames, event, args, bubble );
	}
}

function notifySubscribers ( ractive, subscribers, event, args ) {

	var i = 0, len = 0, originalEvent = null, stopEvent = false;

	if ( event ) {
		args = [ event ].concat( args );
	}

	for ( i=0, len=subscribers.length; i<len; i+=1 ) {
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


