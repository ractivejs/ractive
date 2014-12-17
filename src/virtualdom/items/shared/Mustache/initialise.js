import { SECTION_UNLESS } from 'config/types';
import createReferenceResolver from '../Resolvers/createReferenceResolver';
import ReferenceExpressionResolver from '../Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';
import ExpressionResolver from '../Resolvers/ExpressionResolver';

export default function Mustache$init ( mustache, options ) {

	var ref, parentFragment, template;

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
		mustache.resolver = createReferenceResolver( mustache, ref, resolve );
	}

	// if it's an expression, we have a bit more work to do
	if ( options.template.x ) {
		mustache.resolver = new ExpressionResolver( mustache, parentFragment, options.template.x, resolveAndRebindChildren );
	}

	if ( options.template.rx ) {
		mustache.resolver = new ReferenceExpressionResolver( mustache, options.template.rx, resolveAndRebindChildren );
	}

	// Special case - inverted sections
	if ( mustache.template.n === SECTION_UNLESS && !mustache.hasOwnProperty( 'value' ) ) {
		mustache.setValue( undefined );
	}

	function resolve ( keypath ) {
		mustache.resolve( keypath );
	}

	function resolveAndRebindChildren ( newKeypath ) {
		var oldKeypath = mustache.keypath;

		if ( newKeypath != oldKeypath ) {
			mustache.resolve( newKeypath );

			if ( oldKeypath !== undefined ) {
				mustache.fragments && mustache.fragments.forEach( f => {
					f.rebind( oldKeypath, newKeypath );
				});
			}
		}
	}
}
