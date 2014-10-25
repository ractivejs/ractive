var lessThan = /</g;
var greaterThan = />/g;
var amp = /&/g;

export default function escapeHtml ( str ) {
	return str
		.replace( amp, '&amp;' )
		.replace( lessThan, '&lt;' )
		.replace( greaterThan, '&gt;' );
}
