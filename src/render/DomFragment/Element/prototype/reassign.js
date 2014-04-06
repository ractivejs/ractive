define([
	'render/shared/utils/assignNewKeypath'
], function (
	assignNewKeypath
) {

	'use strict';

	return function reassignElement ( indexRef, newIndex, oldKeypath, newKeypath ) {
		var i, storage, masterEventName, proxies, proxy, binding, bindings, liveQueries, ractive;

		i = this.attributes.length;
		while ( i-- ) {
			this.attributes[i].reassign( indexRef, newIndex, oldKeypath, newKeypath );
		}

		if ( storage = this.node._ractive ) {

			//adjust keypath if needed
			assignNewKeypath(storage, 'keypath', oldKeypath, newKeypath);

			if ( indexRef != undefined ) {
				storage.index[ indexRef ] = newIndex;
			}

			for ( masterEventName in storage.events ) {
				proxies = storage.events[ masterEventName ].proxies;
				i = proxies.length;

				while ( i-- ) {
					proxy = proxies[i];

					if ( typeof proxy.n === 'object' ) {
						proxy.a.reassign( indexRef, newIndex, oldKeypath, newKeypath );
					}

					if ( proxy.d ) {
						proxy.d.reassign( indexRef, newIndex, oldKeypath, newKeypath );
					}
				}
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
			this.fragment.reassign( indexRef, newIndex, oldKeypath, newKeypath );
		}

		// Update live queries, if necessary
		if ( liveQueries = this.liveQueries ) {
			ractive = this.root;

			i = liveQueries.length;
			while ( i-- ) {
				liveQueries[i]._makeDirty();
			}
		}
	};

});
