import { SECTION_UNLESS } from 'config/types';
import resolveRef from 'shared/resolveRef';

export function initialiseMustache ( mustache, options ) {
	var ref, handler;

	const { parentFragment, template } = options;

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
