define([
	'shared/resolveRef',
	'render/DomFragment/Component/initialise/createBindings/createBinding'
], function (
	resolveRef,
	createBinding
) {

	'use strict';

	// This function attempts to resolve references in parent data contexts
	return function ( component, dependant ) {
		var instance, parent, proxy, keypath, contextStack, resolve, makeResolver;

		instance = dependant.root;

		makeResolver = function ( instance ) {
			return function ( keypath ) {
				if ( dependant.keypath ) {
					return;
				}

				createBinding( component, instance, keypath, dependant.ref, {
					propagateDown: true
				});
			};
		};

		while ( parent = instance._parent ) {
			contextStack = instance.component.parentFragment.contextStack;
			keypath = resolveRef( parent, dependant.ref, contextStack );

			resolve = makeResolver( parent );

			if ( keypath ) {
				resolve( keypath );
				return;
			} else {
				proxy = {
					root: parent,
					ref: dependant.ref,
					contextStack: contextStack,
					resolve: resolve
				};

				parent._pendingResolution.push( proxy );
			}

			instance = parent;
		}
	};

});