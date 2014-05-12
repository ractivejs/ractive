export default function ( string, indent ) {
	var indented;

	if ( !indent ) {
		return string;
	}

	indented = string.split( '\n' ).map( function ( line, notFirstLine ) {
		return notFirstLine ? indent + line : line;
	}).join( '\n' );

	return indented;
}
