import { SECTION_UNLESS } from 'config/types';

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


	var keypath = mustache.root.viewmodel.getModel( template, mustache );
	mustache.resolve( keypath );

	// Special case - inverted sections
	if ( mustache.template.n === SECTION_UNLESS && !mustache.hasOwnProperty( 'value' ) ) {
		mustache.setValue( undefined );
	}

}
