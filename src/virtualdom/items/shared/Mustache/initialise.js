import { SECTION_UNLESS } from 'config/types';
import { getByTemplate } from 'viewmodel/prototype/getContext'; // TEMP

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

	// TODO: go through and change use of .keypath to .context
	var context = mustache.context = mustache.keypath = getByTemplate( mustache.root.viewmodel, template, mustache );

	if ( mustache.isStatic ) {
		mustache.setValue( context.get() );
	}
	else {
		context.register( 'setValue', mustache );
	}

	// Special case - inverted sections
	if ( mustache.template.n === SECTION_UNLESS && !mustache.hasOwnProperty( 'value' ) ) {
		mustache.setValue( undefined );
	}

}
