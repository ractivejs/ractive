const remove = /\/\*(?:[\s\S]*?)\*\//g;
const escape = /url\(\s*(['"])(?:\\[\s\S]|(?!\1).)*\1\s*\)|url\((?:\\[\s\S]|[^)])*\)|(['"])(?:\\[\s\S]|(?!\2).)*\2/gi;
const value = /\0(\d+)/g;

// Removes comments and strings from the given CSS to make it easier to parse.
// Callback receives the cleaned CSS and a function which can be used to put
// the removed strings back in place after parsing is done.
export default function ( css, callback, additionalReplaceRules = [] ) {
	const values = [];
	const reconstruct = css => css.replace( value, ( match, n ) => values[ n ] );
	css = css.replace( escape, match => `\0${values.push( match ) - 1}`).replace( remove, '' );

	additionalReplaceRules.forEach( ( pattern ) => {
		css = css.replace( pattern, match => `\0${values.push( match ) - 1}` );
	});

	return callback( css, reconstruct );
}
