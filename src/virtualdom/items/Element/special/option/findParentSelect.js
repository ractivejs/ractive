export default function findParentSelect ( element ) {
	do {
		if ( element.name === 'select' ) {
			return element;
		}
	} while ( element = element.parent );
}
