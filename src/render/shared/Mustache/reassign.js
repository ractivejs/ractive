define([
	'render/shared/utils/getNewKeypath'
], function (
	getNewKeypath
) {

	'use strict';

	return function reassignMustache ( indexRef, newIndex, oldKeypath, newKeypath ) {
		var updated, i;

		// expression mustache?
		if ( this.resolver ) {
			this.resolver.reassign( indexRef, newIndex, oldKeypath, newKeypath );
		}

		// normal keypath mustache?
		else if ( this.keypath ) {
			updated =  getNewKeypath( this.keypath, oldKeypath, newKeypath );

			// was a new keypath created?
			if ( updated ) {
				// resolve it
				this.resolve( updated );
			}
		}

		// index ref mustache?
		else if ( indexRef !== undefined && this.indexRef === indexRef ) {
			this.value = newIndex;
			this.render( newIndex );
		}

		// otherwise, it's an unresolved reference. the context stack has been updated
		// so it will take care of itself

		// if it's a section mustache, we need to go through any children
		if ( this.fragments ) {
			i = this.fragments.length;
			while ( i-- ) {
				this.fragments[i].reassign( indexRef, newIndex, oldKeypath, newKeypath );
			}
		}
	};

});
