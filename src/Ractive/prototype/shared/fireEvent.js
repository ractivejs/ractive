export default function fireEvent ( ractive, eventName, options = {} ) {

	if ( ractive.bubble ) {

		if ( options.event ) {
			options.event._bubble = true;
			options.event.stopBubble = function () { this._bubble = false; }
		}
	}

	fireEventAs(
		ractive,
		eventName,
		options.event,
		options.args,
		ractive.bubble,
		true, // root fire
		options.changeBubbleContext );

}

function fireEventAs  ( ractive, eventName, event, args, bubble, rootInstance, changeContext ) {

	if ( !ractive ) { return; }

	var subscribers = ractive._subs[ eventName ];

	if ( subscribers ) {
		bubble = notifySubscribers( ractive, subscribers, event, args ) && bubble && ractive.bubble;
	}

	if ( bubble ) {

		if ( rootInstance ) {
			let eventNamespace = '';
			if ( eventNamespace = ractive.component.eventNamespace ) {
				eventName = eventNamespace + '.' + eventName;
			}

			if ( changeContext && ractive._parent && ractive.component ) {
				let fragment = ractive.component.parentFragment;
				event.index = fragment.indexRefs;
				event.keypath = fragment.context;
				event.context = ractive._parent.get( event.keypath );
			}
		}

		fireEventAs( ractive._parent, eventName, event, args, bubble );
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


