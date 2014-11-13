export default function findParentSelect ( element ) {
	if ( !element ) { return; }

	do {
		if ( element.name === 'select' ) {
			return element;
		}
	} while ( element = element.parent );
}
