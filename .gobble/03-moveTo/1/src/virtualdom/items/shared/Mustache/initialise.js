define(['config/types','global/runloop','shared/resolveRef','virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver','virtualdom/items/shared/Resolvers/ExpressionResolver'],function (types, runloop, resolveRef, ReferenceExpressionResolver, ExpressionResolver) {

	'use strict';
	
	return function Mustache$init ( mustache, options ) {
	
		var ref, keypath, indexRefs, index, parentFragment, template;
	
		parentFragment = options.parentFragment;
		template = options.template;
	
		mustache.root           = parentFragment.root;
		mustache.parentFragment = parentFragment;
		mustache.pElement       = parentFragment.pElement;
	
		mustache.template       = options.template;
		mustache.index          = options.index || 0;
		mustache.priority       = parentFragment.priority;
		mustache.isStatic       = options.template.s;
	
		mustache.type = options.template.t;
	
		// if this is a simple mustache, with a reference, we just need to resolve
		// the reference to a keypath
		if ( ref = template.r ) {
			indexRefs = parentFragment.indexRefs;
	
			if ( indexRefs && ( index = indexRefs[ ref ] ) !== undefined ) {
				mustache.indexRef = ref;
				mustache.setValue( index );
				return;
			}
	
			keypath = resolveRef( mustache.root, ref, mustache.parentFragment );
			if ( keypath !== undefined ) {
				mustache.resolve( keypath );
			}
	
			else {
				mustache.ref = ref;
				runloop.addUnresolved( mustache );
			}
		}
	
		// if it's an expression, we have a bit more work to do
		if ( options.template.x ) {
			mustache.resolver = new ExpressionResolver( mustache, parentFragment, options.template.x, resolveAndRebindChildren );
		}
	
		if ( options.template.rx ) {
			mustache.resolver = new ReferenceExpressionResolver( mustache, options.template.rx, resolveAndRebindChildren );
		}
	
		// Special case - inverted sections
		if ( mustache.template.n === types.SECTION_UNLESS && !mustache.hasOwnProperty( 'value' ) ) {
			mustache.setValue( undefined );
		}
	
		function resolveAndRebindChildren ( newKeypath ) {
			var oldKeypath = mustache.keypath;
	
			if ( newKeypath !== oldKeypath ) {
				mustache.resolve( newKeypath );
	
				if ( oldKeypath !== undefined ) {
					mustache.fragments && mustache.fragments.forEach( function(f ) {
						f.rebind( null, null, oldKeypath, newKeypath );
					});
				}
			}
		}
	};

});