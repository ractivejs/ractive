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

	var context = mustache.context = getByTemplate( mustache.root.viewmodel, template, mustache );

	// TODO remove this, once we're sure it isn't used anywhere
	Object.defineProperty( mustache, 'keypath', {
		get () {
			throw new Error( '.keypath should be .context' );
		}
	});

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
