export default function Ractive$fire ( eventName, event ) {
	var args, i, len, originalEvent, stopEvent = false, subscribers = this._subs[ eventName ];

	if ( this.component ) {
		eventName = this.component.name + '.' + eventName;
		subscribers = addParents( this._parent, subscribers, eventName );
	}

	if ( !subscribers ) {
		return;
	}

	args = Array.prototype.slice.call( arguments, 1 );

	for ( i=0, len=subscribers.length; i<len; i+=1 ) {
		if ( subscribers[ i ].apply( this, args ) === false ) {
			stopEvent = true;
		}
	}
	if ( stopEvent && ( originalEvent = event.original ) ) {
		originalEvent.preventDefault && originalEvent.preventDefault();
		originalEvent.stopPropagation && originalEvent.stopPropagation();
	}
}

function addParents ( ractive, subscribers, eventName ) {
	if( !ractive ) { return subscribers; }

	var subs = addParents( ractive._parent, ractive._subs[ eventName ], eventName );

	if ( subs && subs.length ) {
		if ( subscribers && subscribers.length ) {
			return subscribers.concat( subs );
		} else {
			return subs;
		}
	} else {
		return subscribers;
	}

}
