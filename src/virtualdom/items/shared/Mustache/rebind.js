export default function Mustache$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	// Children first
	if ( this.fragments ) {
		this.fragments.forEach( f => f.rebind( indexRef, newIndex, oldKeypath, newKeypath ) );
	}

	// Expression mustache?
	if ( this.resolver ) {
		this.resolver.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}
}
