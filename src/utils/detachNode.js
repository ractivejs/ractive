export default function detachNode ( node ) {
	if ( node && node.parentNode ) {
		node.parentNode.removeChild( node );
	}

	return node;
}
