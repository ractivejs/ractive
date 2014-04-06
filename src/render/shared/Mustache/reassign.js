define([
	'render/shared/utils/getNewKeypath',
	'render/shared/Resolvers/ExpressionResolver'
], function (
	getNewKeypath,
	ExpressionResolver
) {

	'use strict';

	return function reassignMustache ( indexRef, newIndex, oldKeypath, newKeypath ) {
		var updated, i, self = this;

		// expression mustache?
		if ( this.descriptor.x ) {
			// TODO should we unregister here, or leave the mustache be in the
			// expectation that it will be unregistered when the expression
			// resolver checks in? For now, the latter (nb if this changes, we
			// need to manually set mustache.resolved = false, otherwise we
			// come up against a nasty bug - #271)

			if ( this.resolver ) {
				this.resolver.teardown();
			}

			this.resolver = new ExpressionResolver( this, this.parentFragment, this.descriptor.x, function ( keypath ) {
				self.resolve( keypath );
			});
		}

		// normal keypath mustache?
		if ( this.keypath ) {
			updated =  getNewKeypath( this.keypath, oldKeypath, newKeypath );

			//was a new keypath created?
			if(updated){
				//resolve it
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
