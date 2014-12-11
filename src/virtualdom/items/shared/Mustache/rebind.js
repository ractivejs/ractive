export default function Mustache$rebind ( oldKeypath, newKeypath ) {
	// Children first
	if ( this.fragments ) {
		this.fragments.forEach( f => f.rebind( oldKeypath, newKeypath ) );
	}

	// Expression mustache?
	if ( this.resolver ) {
		this.resolver.rebind( oldKeypath, newKeypath );
	}
}
