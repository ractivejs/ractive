export default function Section$detach () {
	var i, len;

	if ( this.docFrag ) {
		len = this.fragments.length;
		for ( i = 0; i < len; i += 1 ) {
			this.docFrag.appendChild( this.fragments[i].detach() );
		}

		return this.docFrag;
	}
}
