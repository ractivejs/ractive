const refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;
const splitPattern = /([^\\](?:\\\\)*)\./;
const escapeKeyPattern = /\\|\./g;
const unescapeKeyPattern = /((?:\\)+)\1|\\(\.)/g;

export function escapeKey ( key ) {
	if ( typeof key === 'string' ) {
		return key.replace( escapeKeyPattern, '\\$&' );
	}

	return key;
}

export function normalise ( ref ) {
	return ref ? ref.replace( refPattern, '.$1' ) : '';
}

export function splitKeypath ( keypath ) {
	let parts = normalise( keypath ).split( splitPattern ),
		result = [];

	for ( let i = 0; i < parts.length; i += 2 ) {
		result.push( parts[i] + ( parts[i + 1] || '' ) );
	}

	return result;
}

export function unescapeKey ( key ) {
	if ( typeof key === 'string' ) {
		return key.replace( unescapeKeyPattern, '$1$2' );
	}

	return key;
}
