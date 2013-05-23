proto.off = function ( eventName, callback ) {
	var subscribers, index;

	// if no callback specified, remove all callbacks
	if ( !callback ) {
		// if no event name specified, remove all callbacks for all events
		if ( !eventName ) {
			this._subs = {};
		} else {
			this._subs[ eventName ] = [];
		}
	}

	subscribers = this._subs[ eventName ];

	if ( subscribers ) {
		index = subscribers.indexOf( callback );
		if ( index !== -1 ) {
			subscribers.splice( index, 1 );
		}
	}
};