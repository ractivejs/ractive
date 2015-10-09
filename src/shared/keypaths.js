const refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

export function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

export function splitKeypath ( keypath ) {
	let parts = normalise( keypath ).replace( '\\.', '$' ).split( '.' );
	for ( let i = parts.length - 1; i >= 0; i-- ) {
		parts[i] = parts[i].replace( '$', '\\.' );
	}
	return parts;
}
