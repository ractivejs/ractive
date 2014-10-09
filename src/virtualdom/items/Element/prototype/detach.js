export default function Element$detach () {
	var node = this.node, parentNode;

	if ( node ) {
		// need to check for parent node - DOM may have been altered
		// by something other than Ractive! e.g. jQuery UI...
		if ( parentNode = node.parentNode ) {
			parentNode.removeChild( node );
		}

		return node;
	}
}
