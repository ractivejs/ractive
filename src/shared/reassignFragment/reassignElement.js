define([
	'circular',
	'shared/reassignFragment/utils/assignNewKeypath'
], function (
	circular,
	assignNewKeypath
) {

	'use strict';

	var reassignFragment;

	circular.push( function () {
		reassignFragment = circular.reassignFragment;
	});

	return function reassignElement ( element, indexRef, newIndex, oldKeypath, newKeypath ) {
		var i, attribute, storage, masterEventName, proxies, proxy, binding, bindings, liveQueries, ractive;

		i = element.attributes.length;
		while ( i-- ) {
			attribute = element.attributes[i];

			if ( attribute.fragment ) {
				reassignFragment( attribute.fragment, indexRef, newIndex, oldKeypath, newKeypath );

				if ( attribute.twoway ) {
					attribute.updateBindings();
				}
			}
		}

		if ( storage = element.node._ractive ) {

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
						reassignFragment( proxy.a, indexRef, newIndex, oldKeypath, newKeypath );
					}

					if ( proxy.d ) {
						reassignFragment( proxy.d, indexRef, newIndex, oldKeypath, newKeypath );
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
		if ( element.fragment ) {
			reassignFragment( element.fragment, indexRef, newIndex, oldKeypath, newKeypath );
		}

		// Update live queries, if necessary
		if ( liveQueries = element.liveQueries ) {
			ractive = element.root;

			i = liveQueries.length;
			while ( i-- ) {
				liveQueries[i]._makeDirty();
			}
		}
	};

});
