export default function ( fragment ) {
	do {
		if ( fragment.context !== undefined ) {
			return fragment.context;
		}
	} while ( fragment = fragment.parent );

	return '';
}
