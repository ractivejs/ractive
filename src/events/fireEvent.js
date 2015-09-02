import { enqueue, dequeue } from './eventStack';
import getPotentialWildcardMatches from '../utils/getPotentialWildcardMatches';

var wildcardCache = {};

export default function fireEvent ( ractive, eventName, options = {} ) {
	if ( !eventName ) { return; }

	if ( !options.event ) {
		options.event = {
			name: eventName,
			// until event not included as argument default
			_noArg: true
		};
	} else {
		options.event.name = eventName;
	}

	var eventNames = getWildcardNames( eventName );

	fireEventAs( ractive, eventNames, options.event, options.args, true );
}

function getWildcardNames ( eventName ) {
	if ( wildcardCache.hasOwnProperty( eventName ) ) {
		return wildcardCache[ eventName ];
	} else {
		return wildcardCache[ eventName ] = getPotentialWildcardMatches( eventName );
	}
}

function fireEventAs  ( ractive, eventNames, event, args, initialFire = false ) {

	var subscribers, i, bubble = true;

	enqueue( ractive, event );

	for ( i = eventNames.length; i >= 0; i-- ) {
		subscribers = ractive._subs[ eventNames[ i ] ];

		if ( subscribers ) {
			bubble = notifySubscribers( ractive, subscribers, event, args ) && bubble;
		}
	}

	dequeue( ractive );

	if ( ractive.parent && bubble ) {

		if ( initialFire && ractive.component ) {
			let fullName = ractive.component.name + '.' + eventNames[ eventNames.length-1 ];
			eventNames = getWildcardNames( fullName );

			if( event && !event.component ) {
				event.component = ractive;
			}
		}

		fireEventAs( ractive.parent, eventNames, event, args );
	}
}

function notifySubscribers ( ractive, subscribers, event, args ) {
	var originalEvent = null, stopEvent = false;

	if ( event && !event._noArg ) {
		args = [ event ].concat( args );
	}

	// subscribers can be modified inflight, e.g. "once" functionality
	// so we need to copy to make sure everyone gets called
	subscribers = subscribers.slice();

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
