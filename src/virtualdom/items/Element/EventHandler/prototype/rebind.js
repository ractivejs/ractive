export default function EventHandler$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	var fragment;
	if ( this.method ) {
		fragment = this.element.parentFragment;
		this.refResolvers.forEach( rebind );

		return;
	}

	if ( typeof this.action !== 'string' ) {
		rebind( this.action );
	}

	if ( this.dynamicParams ) {
		rebind( this.dynamicParams );
	}

	function rebind ( thing ) {
		thing && thing.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}
}
