export default function fireEvent ( ractive, eventName, options = {} ) {

	var bubble = ( eventName[0] === '*' );
	if ( bubble ) {
		eventName = eventName.substr(1);
	}

	fireEventAs( ractive, eventName, options.event, options.args, bubble, true );

}

function fireEventAs  ( ractive, eventName, event, args, bubble, rootInstance ) {

	if ( !ractive ) { return; }

	var subscribers = ractive._subs[ eventName ];

	if ( subscribers ) {
		bubble = notifySubscribers( ractive, subscribers, event, args ) && bubble;
	}

	if ( bubble ) {

		if ( rootInstance ) {
			let eventNamespace = '';
			if ( eventNamespace = ractive.component.eventNamespace ) {
				eventName = eventNamespace + '.' + eventName;
			}
		}

		fireEventAs( ractive._parent, eventName, event, args, bubble );
	}
}

function notifySubscribers ( ractive, subscribers, event, args ) {

	var i = 0, len = 0, originalEvent = null, stopEvent = false, bubble = true;

	if ( event ) {
		// TODO: create eventobject with proto method
		event.stopBubble = function () { bubble = false; };
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

	return bubble;
}


