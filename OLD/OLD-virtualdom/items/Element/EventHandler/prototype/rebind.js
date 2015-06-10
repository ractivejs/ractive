export default function EventHandler$rebind ( oldKeypath, newKeypath ) {
	var fragment;
	if ( this.method ) {
		return;
	}

	if ( typeof this.action !== 'string' ) {
		rebind( this.action );
	}

	if ( this.dynamicParams ) {
		rebind( this.dynamicParams );
	}

	function rebind ( thing ) {
		thing && thing.rebind( oldKeypath, newKeypath );
	}
}
