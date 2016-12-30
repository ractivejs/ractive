export default function resetStyle ( node, style ) {
	if ( style ) {
		node.setAttribute( 'style', style );
	} else {
		// Next line is necessary, to remove empty style attribute!
		// See http://stackoverflow.com/a/7167553
		node.getAttribute( 'style' );
		node.removeAttribute( 'style' );
	}
}
