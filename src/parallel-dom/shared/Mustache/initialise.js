import types from 'config/types';
import runloop from 'global/runloop';
import resolveRef from 'shared/resolveRef';
import ReferenceExpressionResolver from 'parallel-dom/shared/Resolvers/ReferenceExpressionResolver';
import ExpressionResolver from 'parallel-dom/shared/Resolvers/ExpressionResolver';

export default function initMustache ( mustache, options ) {

	var ref, indexRefs, index, parentFragment, template;

	parentFragment = options.parentFragment;
	template = options.template;

	mustache.root           = parentFragment.root;
	mustache.parentFragment = parentFragment;
	mustache.pElement       = parentFragment.pElement;

	mustache.template     = options.template;
	mustache.index          = options.index || 0;
	mustache.priority       = parentFragment.priority;

	mustache.type = options.template.t;

	function resolve ( keypath ) {
		mustache.resolve( keypath );
	}

	function resolveWithRef ( ref ) {
		var keypath = resolveRef( mustache.root, ref, mustache.parentFragment );

		if ( keypath !== undefined ) {
			resolve( keypath );
		} else {
			mustache.ref = ref;
			runloop.addUnresolved( mustache );
		}
	}


	// if this is a simple mustache, with a reference, we just need to resolve
	// the reference to a keypath
	if ( ref = template.r ) {
		indexRefs = parentFragment.indexRefs;

		if ( indexRefs && ( index = indexRefs[ ref ] ) !== undefined ) {
			mustache.indexRef = ref;
			mustache.setValue( index );
		}

		else {
			resolveWithRef( ref );
		}
	}

	// if it's an expression, we have a bit more work to do
	if ( options.template.x ) {
		mustache.resolver = new ExpressionResolver( mustache, parentFragment, options.template.x, resolve );
	}

	if ( options.template.rx ) {
		mustache.resolver = new ReferenceExpressionResolver( mustache, options.template.rx, resolveWithRef );
	}

	// Special case - inverted sections
	if ( mustache.template.n === types.SECTION_UNLESS && !mustache.hasOwnProperty( 'value' ) ) {
		mustache.setValue( undefined );
	}
}
