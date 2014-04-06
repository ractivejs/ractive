define([
	'global/runloop',
	'shared/resolveRef',
	'render/shared/Resolvers/KeypathExpressionResolver',
	'render/shared/Resolvers/ExpressionResolver'
], function (
	runloop,
	resolveRef,
	KeypathExpressionResolver,
	ExpressionResolver
) {

	'use strict';

	return function initMustache ( mustache, options ) {

		var ref, keypath, indexRefs, index, parentFragment, descriptor, resolve;

		parentFragment = options.parentFragment;
		descriptor = options.descriptor;

		mustache.root           = parentFragment.root;
		mustache.parentFragment = parentFragment;

		mustache.descriptor     = options.descriptor;
		mustache.index          = options.index || 0;
		mustache.priority       = parentFragment.priority;

		mustache.type = options.descriptor.t;

		resolve = function ( keypath ) {
			mustache.resolve( keypath );
		};


		// if this is a simple mustache, with a reference, we just need to resolve
		// the reference to a keypath
		if ( ref = descriptor.r ) {
			indexRefs = parentFragment.indexRefs;

			if ( indexRefs && ( index = indexRefs[ ref ] ) !== undefined ) {
				mustache.indexRef = ref;
				mustache.value = index;
				mustache.render( mustache.value );
			}

			else {
				keypath = resolveRef( mustache.root, ref, mustache.parentFragment );

				if ( keypath !== undefined ) {
					resolve( keypath );
				} else {
					mustache.ref = ref;
					runloop.addUnresolved( mustache );
				}
			}
		}

		// if it's an expression, we have a bit more work to do
		if ( options.descriptor.x ) {
			mustache.resolver = new ExpressionResolver( mustache, parentFragment, options.descriptor.x, resolve );
		}

		if ( options.descriptor.kx ) {
			mustache.resolver = new KeypathExpressionResolver( mustache, options.descriptor.kx, resolve );
		}

		// Special case - inverted sections
		if ( mustache.descriptor.n && !mustache.hasOwnProperty( 'value' ) ) {
			mustache.render( undefined );
		}
	};

});
