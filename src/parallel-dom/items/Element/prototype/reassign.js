import assignNewKeypath from 'parallel-dom/shared/utils/assignNewKeypath';

export default function Element$reassign ( indexRef, newIndex, oldKeypath, newKeypath ) {
	var i, storage, binding, bindings, liveQueries, ractive;

	if ( this.attributes ) {
		this.attributes.forEach( reassign );
	}

	if ( this.eventHandlers ) {
		this.eventHandlers.forEach( reassign );
	}

	if ( this.binding ) {
		reassign( this.binding );
	}

	if ( storage = this.node._ractive ) {

		//adjust keypath if needed
		assignNewKeypath(storage, 'keypath', oldKeypath, newKeypath);

		if ( indexRef != undefined ) {
			storage.index[ indexRef ] = newIndex;
		}

		if ( binding = storage.binding ) {
			if ( binding.keypath.substr( 0, oldKeypath.length ) === oldKeypath ) {
				bindings = storage.root._twowayBindings[ binding.keypath ];

				// remove binding reference for old keypath
				bindings.splice( bindings.indexOf( binding ), 1 );

				// update keypath
				binding.keypath = binding.keypath.replace( oldKeypath, newKeypath );

				// add binding reference for new keypath
				bindings = storage.root._twowayBindings[ binding.keypath ] || ( storage.root._twowayBindings[ binding.keypath ] = [] );
				bindings.push( binding );
			}
		}
	}

	// reassign children
	if ( this.fragment ) {
		reassign( this.fragment );
	}

	// Update live queries, if necessary
	if ( liveQueries = this.liveQueries ) {
		ractive = this.root;

		i = liveQueries.length;
		while ( i-- ) {
			liveQueries[i]._makeDirty();
		}
	}

	function reassign ( thing ) {
		thing.reassign( indexRef, newIndex, oldKeypath, newKeypath );
	}
}
