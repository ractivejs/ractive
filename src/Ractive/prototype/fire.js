export default function Ractive$fire ( eventName, event ) {
	var args, i, len, result, originalEvent, subscribers = this._subs[ eventName ];

	if ( !subscribers ) {
		return;
	}

	args = Array.prototype.slice.call( arguments, 1 );

	for ( i=0, len=subscribers.length; i<len; i+=1 ) {
		result = subscribers[ i ].apply( this, args );
		if ( ( result === false ) && ( originalEvent = event.original ) ) {
			originalEvent.preventDefault && originalEvent.preventDefault();
			originalEvent.stopPropagation && originalEvent.stopPropagation();
		}
	}
}
