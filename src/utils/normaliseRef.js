var regex = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

export default function normaliseRef ( ref ) {
	return ( ref || '' ).replace( regex, '.$1' );
}
