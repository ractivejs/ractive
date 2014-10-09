export default function Triple$detach () {
	var len, i;

	if ( this.docFrag ) {
		len = this.nodes.length;
		for ( i = 0; i < len; i += 1 ) {
			this.docFrag.appendChild( this.nodes[i] );
		}

		return this.docFrag;
	}
}
