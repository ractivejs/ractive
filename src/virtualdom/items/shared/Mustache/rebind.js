export default function Mustache$rebind ( oldKeypath, newKeypath, newValue = true ) {
	// Children first
	if ( this.fragments ) {
		this.fragments.forEach( f => f.rebind( oldKeypath, newKeypath, newValue ) );
	}

	// Expression mustache?
	if ( this.resolver ) {
		this.resolver.rebind( oldKeypath, newKeypath, newValue );
	}
}
