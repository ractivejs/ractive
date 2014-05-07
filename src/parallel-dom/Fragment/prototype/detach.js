export default function Fragment$detach () {
	var len, i;

	if ( this.docFrag ) {
		// if this was built from HTML, we just need to remove the nodes
		if ( this.nodes ) {
			len = this.nodes.length;
			for ( i = 0; i < len; i += 1 ) {
				this.docFrag.appendChild( this.nodes[i] );
			}
		}

		// otherwise we need to detach each item
		else if ( this.items ) {
			len = this.items.length;
			for ( i = 0; i < len; i += 1 ) {
				this.docFrag.appendChild( this.items[i].detach() );
			}
		}

		return this.docFrag;
	}
}
