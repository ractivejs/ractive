export default function EventHandler$reassign ( indexRef, newIndex, oldKeypath, newKeypath ) {
	if ( typeof this.action !== 'string' ) {
		this.action.reassign( indexRef, newIndex, oldKeypath, newKeypath );
	}

	if ( this.dynamicParams ) {
		this.dynamicParams.reassign( indexRef, newIndex, oldKeypath, newKeypath );
	}
}
