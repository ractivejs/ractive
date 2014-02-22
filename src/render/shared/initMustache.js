define([
	'global/runloop',
	'shared/resolveRef',
	'render/shared/ExpressionResolver/_ExpressionResolver'
], function (
	runloop,
	resolveRef,
	ExpressionResolver
) {

	'use strict';

	return function initMustache ( mustache, options ) {

		var keypath, indexRef, parentFragment;

		parentFragment = mustache.parentFragment = options.parentFragment;

		mustache.root           = parentFragment.root;

		mustache.descriptor     = options.descriptor;
		mustache.index          = options.index || 0;
		mustache.priority       = parentFragment.priority;

		mustache.type = options.descriptor.t;


		// if this is a simple mustache, with a reference, we just need to resolve
		// the reference to a keypath
		if ( options.descriptor.r ) {
			if ( parentFragment.indexRefs && parentFragment.indexRefs[ options.descriptor.r ] !== undefined ) {
				indexRef = parentFragment.indexRefs[ options.descriptor.r ];

				mustache.indexRef = options.descriptor.r;
				mustache.value = indexRef;
				mustache.render( mustache.value );
			}

			else {
				keypath = resolveRef( mustache.root, options.descriptor.r, mustache.parentFragment );

				if ( keypath !== undefined ) {
					mustache.resolve( keypath );
				} else {
					mustache.ref = options.descriptor.r;
					runloop.addUnresolved( mustache );
				}
			}
		}

		// if it's an expression, we have a bit more work to do
		if ( options.descriptor.x ) {
			mustache.expressionResolver = new ExpressionResolver( mustache );
		}

		// Special case - inverted sections
		if ( mustache.descriptor.n && !mustache.hasOwnProperty( 'value' ) ) {
			mustache.render( undefined );
		}
	};

});
