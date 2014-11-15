import assignNewKeypath from 'shared/keypaths/assignNew';

export default function Element$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	var i, storage, liveQueries, ractive;

	if ( this.attributes ) {
		this.attributes.forEach( rebind );
	}

	if ( this.conditionalAttributes ) {
		this.conditionalAttributes.forEach( rebind );
	}

	if ( this.eventHandlers ) {
		this.eventHandlers.forEach( rebind );
	}

	if ( this.decorator ) {
		rebind( this.decorator );
	}

	// rebind children
	if ( this.fragment ) {
		rebind( this.fragment );
	}

	// Update live queries, if necessary
	if ( liveQueries = this.liveQueries ) {
		ractive = this.root;

		i = liveQueries.length;
		while ( i-- ) {
			liveQueries[i]._makeDirty();
		}
	}

	if ( this.node && ( storage = this.node._ractive ) ) {

		// adjust keypath if needed
		assignNewKeypath( storage, 'keypath', oldKeypath, newKeypath );

		if ( indexRef != undefined ) {
			storage.index[ indexRef ] = newIndex;
		}
	}

	function rebind ( thing ) {
		thing.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}
}
