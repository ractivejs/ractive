export default function ( hyphenatedStr ) {
	return hyphenatedStr.replace( /-([a-zA-Z])/g, ( match, $1 ) => {
		return $1.toUpperCase();
	});
}
