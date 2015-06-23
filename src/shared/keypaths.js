let refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

export function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

export function splitKeypath ( keypath ) {
	return normalise( keypath ).split( '.' );
}
