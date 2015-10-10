const refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
const escapePattern = /\\\./g;
const unescapePattern = /\$/g;

export function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

export function splitKeypath ( keypath ) {
	let parts = normalise( keypath ).replace( escapePattern, '$' ).split( '.' );
	for ( let i = parts.length - 1; i >= 0; i-- ) {
		parts[i] = parts[i].replace( unescapePattern, '\\.' );
	}
	return parts;
}
