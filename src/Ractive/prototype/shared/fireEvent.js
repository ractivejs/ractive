import getPotentialWildcardMatches from 'utils/getPotentialWildcardMatches';

export default function fireEvent ( ractive, eventName, options = {} ) {
	if ( !eventName ) { return; }

	if ( !options.event ) {

		options.event = {
			name: eventName,
			context: ractive.data,
			keypath: '',
			// until event not included as argument default
			_noArg: true
		};

	}
	else {
		options.event.name = eventName;
	}

	var eventNames = getPotentialWildcardMatches( eventName );
	fireEventAs( ractive, eventNames, options.event, options.args, true );
}

function fireEventAs  ( ractive, eventNames, event, args, initialFire = false ) {

	var subscribers, i, bubble = true;

	if ( event ) {
		ractive.event = event;
	}

	for ( i = eventNames.length; i >= 0; i-- ) {
		subscribers = ractive._subs[ eventNames[ i ] ];

		if ( subscribers ) {
			bubble = notifySubscribers( ractive, subscribers, event, args ) && bubble;
		}
	}

	if ( event ) {
		delete ractive.event;
	}

	if ( ractive._parent && bubble ) {

		if ( initialFire && ractive.component ) {
			let fullName = ractive.component.name + '.' + eventNames[ eventNames.length-1 ];
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

	if ( ractive.eventObject && event && !event._noArg ) {
		args = [ event ].concat( args );
	}

	for ( let i = 0, len = subscribers.length; i < len; i += 1 ) {
		if ( subscribers[ i ].apply( ractive, args ) === false ) {
			stopEvent = true;
		}
	}

	if ( event && !event._noArg && stopEvent && ( originalEvent = event.original ) ) {
		originalEvent.preventDefault && originalEvent.preventDefault();
		originalEvent.stopPropagation && originalEvent.stopPropagation();
	}

	return !stopEvent;
}


