define(['virtualdom/items/shared/utils/getNewKeypath'],function (getNewKeypath) {

	'use strict';
	
	return function Mustache$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
		var keypath;
	
		// Children first
		if ( this.fragments ) {
			this.fragments.forEach( function(f ) {return f.rebind( indexRef, newIndex, oldKeypath, newKeypath )} );
		}
	
		// Expression mustache?
		if ( this.resolver ) {
			this.resolver.rebind( indexRef, newIndex, oldKeypath, newKeypath );
		}
	
		// Normal keypath mustache or reference expression?
		if ( this.keypath !== undefined ) {
			keypath = getNewKeypath( this.keypath, oldKeypath, newKeypath );
			// was a new keypath created?
			if ( keypath !== undefined ) {
				// resolve it
				this.resolve( keypath );
			}
		}
	
		// index ref mustache?
		else if ( indexRef !== undefined && this.indexRef === indexRef ) {
			this.setValue( newIndex );
		}
	};

});