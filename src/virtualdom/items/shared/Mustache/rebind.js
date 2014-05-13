import getNewKeypath from 'virtualdom/items/shared/utils/getNewKeypath';

export default function Mustache$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	var updated;

	// Children first
	if ( this.fragments ) {
		this.fragments.forEach( f => f.rebind( indexRef, newIndex, oldKeypath, newKeypath ) );
	}

	// Expression mustache?
	if ( this.resolver ) {
		this.resolver.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}

	// Normal keypath mustache or reference expression?
	if ( this.keypath ) {
		updated = getNewKeypath( this.keypath, oldKeypath, newKeypath );

		// was a new keypath created?
		if ( updated ) {
			// resolve it
			this.resolve( updated );
		}
	}

	// index ref mustache?
	else if ( indexRef !== undefined && this.indexRef === indexRef ) {
		this.setValue( newIndex );
	}
}
