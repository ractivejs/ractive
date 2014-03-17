define([
	'config/types',
	'shared/unregisterDependant',
	'render/shared/ExpressionResolver/_ExpressionResolver'
], function (
	types,
	unregisterDependant,
	ExpressionResolver
) {

	'use strict';

	return reassignFragment;

	function reassignFragment ( fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath ) {
		var i, item, context, query;

		// If this fragment was rendered with innerHTML, we have nothing to do
		// TODO a less hacky way of determining this
		if ( fragment.html ) {
			return;
		}

		if ( fragment.indexRefs && fragment.indexRefs[ indexRef ] !== undefined ) {
			fragment.indexRefs[ indexRef ] = newIndex;
		}

		// fix context stack
		i = fragment.contextStack.length;
		while ( i-- ) {
			context = fragment.contextStack[i];
			if ( context.substr( 0, oldKeypath.length ) === oldKeypath ) {
				fragment.contextStack[i] = context.replace( oldKeypath, newKeypath );
			}
		}

		i = fragment.items.length;
		while ( i-- ) {
			item = fragment.items[i];

			switch ( item.type ) {
				case types.ELEMENT:
				reassignElement( item, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
				break;

				case types.PARTIAL:
				reassignFragment( item.fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
				break;

				case types.COMPONENT:
				reassignFragment( item.instance.fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
				if ( query = fragment.root._liveComponentQueries[ item.name ] ) {
					query._makeDirty();
				}
				break;

				case types.SECTION:
				case types.INTERPOLATOR:
				case types.TRIPLE:
				reassignMustache( item, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
				break;
			}
		}
	}

	function reassignElement ( element, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath ) {
		var i, attribute, storage, masterEventName, proxies, proxy, binding, bindings, liveQueries, ractive;

		i = element.attributes.length;
		while ( i-- ) {
			attribute = element.attributes[i];

			if ( attribute.fragment ) {
				reassignFragment( attribute.fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );

				if ( attribute.twoway ) {
					attribute.updateBindings();
				}
			}
		}

		if ( storage = element.node._ractive ) {
			if ( storage.keypath.substr( 0, oldKeypath.length ) === oldKeypath ) {
				storage.keypath = storage.keypath.replace( oldKeypath, newKeypath );
			}

			if ( indexRef !== undefined ) {
				storage.index[ indexRef ] = newIndex;
			}

			for ( masterEventName in storage.events ) {
				proxies = storage.events[ masterEventName ].proxies;
				i = proxies.length;

				while ( i-- ) {
					proxy = proxies[i];

					if ( typeof proxy.n === 'object' ) {
						reassignFragment( proxy.a, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
					}

					if ( proxy.d ) {
						reassignFragment( proxy.d, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
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
			reassignFragment( element.fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
		}

		// Update live queries, if necessary
		if ( liveQueries = element.liveQueries ) {
			ractive = element.root;

			i = liveQueries.length;
			while ( i-- ) {
				ractive._liveQueries[ liveQueries[i] ]._makeDirty();
			}
		}
	}

	function reassignMustache ( mustache, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath ) {
		var i;

		// expression mustache?
		if ( mustache.descriptor.x ) {
			// TODO should we unregister here, or leave the mustache be in the
			// expectation that it will be unregistered when the expression
			// resolver checks in? For now, the latter (nb if this changes, we
			// need to manually set mustache.resolved = false, otherwise we
			// come up against a nasty bug - #271)

			if ( mustache.expressionResolver ) {
				mustache.expressionResolver.teardown();
			}

			mustache.expressionResolver = new ExpressionResolver( mustache );
		}

		// normal keypath mustache?
		if ( mustache.keypath ) {
			if ( mustache.keypath.substr( 0, oldKeypath.length ) === oldKeypath ) {
				mustache.resolve( mustache.keypath.replace( oldKeypath, newKeypath ) );
			}
		}

		// index ref mustache?
		else if ( indexRef !== undefined && mustache.indexRef === indexRef ) {
			mustache.value = newIndex;
			mustache.render( newIndex );
		}

		// otherwise, it's an unresolved reference. the context stack has been updated
		// so it will take care of itself

		// if it's a section mustache, we need to go through any children
		if ( mustache.fragments ) {
			i = mustache.fragments.length;
			while ( i-- ) {
				reassignFragment( mustache.fragments[i], indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
			}
		}
	}

});