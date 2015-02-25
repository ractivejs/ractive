import { SECTION_UNLESS } from 'config/types';
import createReferenceResolver from '../Resolvers/createReferenceResolver';

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

	var keypath = mustache.root.viewmodel.getKeypath( template, mustache, resolve );


	resolve( keypath );

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
