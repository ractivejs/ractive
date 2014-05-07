export default function Fragment$teardown ( destroy ) {
	var node;

	// if this was built from HTML, we just need to remove the nodes
	if ( this.nodes && destroy ) {
		while ( node = this.nodes.pop() ) {
			node.parentNode.removeChild( node );
		}
	}

	// otherwise we need to detach each item
	else if ( this.items ) {
		while ( this.items.length ) {
			this.items.pop().teardown( destroy );
		}
	}

	this.nodes = this.items = this.docFrag = null;
}
