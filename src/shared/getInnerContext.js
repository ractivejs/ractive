export default function ( fragment ) {
	var original = fragment;

 	do {
 		if ( fragment.context !== undefined ) {
 			return fragment.context;
 		}
 	} while ( fragment = fragment.parent );

	return original.root.viewmodel.rootKeypath;
 }
