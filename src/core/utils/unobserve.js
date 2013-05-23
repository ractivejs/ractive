/*utils.unobserve = function ( root, observerRef ) {
	var priorityGroups, observers, index, i, len;

	priorityGroups = root._observers[ observerRef.keypath ];
	if ( !priorityGroups ) {
		// nothing to unobserve
		return;
	}

	observers = priorityGroups[ observerRef.priority ];
	if ( !observers ) {
		// nothing to unobserve
		return;
	}

	if ( observers.indexOf ) {
		index = observers.indexOf( observerRef.observer );
	} else {
		// fuck you IE
		for ( i=0, len=observers.length; i<len; i+=1 ) {
			if ( observers[i] === observerRef.mustache ) {
				index = i;
				break;
			}
		}
	}


	if ( index === -1 ) {
		// nothing to unobserve
		return;
	}

	// remove the observer from the list...
	observers.splice( index, 1 );

	// ...then tidy up if necessary
	if ( observers.length === 0 ) {
		delete priorityGroups[ observerRef.priority ];
	}

	if ( priorityGroups.length === 0 ) {
		delete root._observers[ observerRef.keypath ];
	}
};*/