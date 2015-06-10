import { SECTION_UNLESS } from 'config/types';
import resolveRef from 'shared/resolveRef';

export default function Mustache$init ( mustache, options ) {

	var ref, parentFragment, template, handler;

	parentFragment = options.parentFragment;
	template = options.template;

	mustache.root           = parentFragment.root;
	mustache.parentFragment = parentFragment;
	mustache.pElement       = parentFragment.pElement;

	mustache.template       = options.template;
	mustache.index          = options.index || 0;
	mustache.isStatic       = options.template.s;

	mustache.type = options.template.t;

	if ( !options.template.r ) {
		throw new Error( 'expressions and reference expressions not yet implemented' );
	}

	var context = mustache.context = resolveRef( mustache.root, options.template.r, parentFragment );
	console.log( 'context', context )

	if ( mustache.isStatic ) {
		mustache.setValue( context.get() );
	}
	else {
		context.register( mustache );
	}

	// Special case - inverted sections
	if ( mustache.template.n === SECTION_UNLESS && !mustache.hasOwnProperty( 'value' ) ) {
		mustache.setValue( undefined );
	}
}
