import resolveSpecialRef from 'shared/resolveSpecialRef';

export default function Mustache$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	// Children first
	if ( this.fragments ) {
		this.fragments.forEach( f => f.rebind( indexRef, newIndex, oldKeypath, newKeypath ) );
	}

	// Expression mustache?
	if ( this.resolver ) {
		this.resolver.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}

	// index ref mustache?
	else if ( indexRef !== undefined && this.indexRef === indexRef ) {
		this.setValue( newIndex );
	}

	// special ref mustache?
	else if ( this.specialRef ) {
		this.setValue( resolveSpecialRef( this.parentFragment, this.specialRef ) );
	}
}
