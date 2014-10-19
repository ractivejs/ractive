import types from 'config/types';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';

export default function Mustache$init ( mustache, options ) {

	var ref, value, parentFragment, fragment, indexRefs, template;

	parentFragment = options.parentFragment;
	template = options.template;

	mustache.root           = parentFragment.root;
	mustache.parentFragment = parentFragment;
	mustache.pElement       = parentFragment.pElement;

	mustache.template       = options.template;
	mustache.index          = options.index || 0;
	mustache.isStatic       = options.template.s;

	mustache.type = options.template.t;

	mustache.registered = false;

	// if this is a simple mustache, with a reference, we just need to resolve
	// the reference to a keypath
	if ( ref = template.r ) {
		// special/index ref?
		if ( ref in parentFragment.indexRefs ) {
			value = parentFragment.indexRefs[ ref ];

			// Need to find the list section the index refers to, for rebinding
			// TODO there must be a better way
			fragment = parentFragment;

			while ( fragment ) {
				if ( fragment.owner.template && fragment.owner.template.i === ref ) {
					// TODO make it possible to unregister
					mustache.root.viewmodel.registerSpecial( fragment.owner.keypath, value, mustache );
					mustache.setValue( parentFragment.indexRefs[ ref ] );
					return;
				}

				fragment = fragment.parent;
			}
		}

		// TODO remove SpecialResolver and IndexResolver
		mustache.resolver = new createReferenceResolver( mustache, ref, resolve );
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

	function resolve ( keypath ) {
		mustache.resolve( keypath );
	}

	function resolveAndRebindChildren ( newKeypath ) {
		var oldKeypath = mustache.keypath;

		if ( newKeypath !== oldKeypath ) {
			mustache.resolve( newKeypath );

			if ( oldKeypath !== undefined ) {
				mustache.fragments && mustache.fragments.forEach( f => {
					f.rebind( null, null, oldKeypath, newKeypath );
				});
			}
		}
	}
}
