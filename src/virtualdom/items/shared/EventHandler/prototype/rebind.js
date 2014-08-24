export default function EventHandler$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	if ( typeof this.action !== 'string' ) {
		this.action.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}

	if ( this.dynamicParams ) {
		this.dynamicParams.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}
}
