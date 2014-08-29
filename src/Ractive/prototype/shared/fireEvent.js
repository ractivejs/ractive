export default function fireEvent ( ractive, eventName, options = {} ) {

	if ( ractive.bubble ) {

		if ( options.event ) {
			options.event._bubble = true;
			options.event.stopBubble = function () { options.event._bubble = false; };
		}
	}

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
			// to bubble or not to bubble:
			// 1. this event doesn't cancel: bubble =
			// 2. not already cancelled: && bubble
			// 3. ractive instance allows bubble: && ractive.bubble
			bubble = notifySubscribers( ractive, subscribers, event, args ) && bubble && ractive.bubble;
		}
	}

	if ( bubble ) {

		if ( initialFire && ractive.bubble !== 'nameOnly' ) {
			// use the explicit namespace option if provided, otherwise component name
			let namespace = ractive.namespace;
			if( !namespace && ractive.component ) {
				namespace = ractive.component.name;
			}

			if ( namespace ) {
				namespace += '.' + eventNames[ 0 ];

				if ( ractive.bubble === 'nsOnly' ) {
					eventNames = [ namespace ];
				}
				else {
					eventNames.push( namespace );
				}
			}
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

	return event ? event._bubble : true;
}


