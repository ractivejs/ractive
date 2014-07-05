export default function ( hyphenatedStr ) {
	return hyphenatedStr.replace( /-([a-zA-Z])/g, function ( match, $1 ) {
		return $1.toUpperCase();
	});
}
