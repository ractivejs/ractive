var lessThan = /</g, greaterThan = />/g;

export default function escapeHtml ( str ) {
	return str
		.replace( lessThan, '&lt;' )
		.replace( greaterThan, '&gt;' );
}
