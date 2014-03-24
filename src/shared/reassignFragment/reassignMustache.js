define([
	'circular',
	'shared/reassignFragment/utils/getNewKeypath',
	'render/shared/Resolvers/ExpressionResolver'
], function (
	circular,
	getNewKeypath,
	ExpressionResolver
) {

	'use strict';

	var reassignFragment;

	circular.push( function () {
		reassignFragment = circular.reassignFragment;
	});

	return function reassignMustache ( mustache, indexRef, newIndex, oldKeypath, newKeypath ) {
		var updated, i;

		// expression mustache?
		if ( mustache.descriptor.x ) {
			// TODO should we unregister here, or leave the mustache be in the
			// expectation that it will be unregistered when the expression
			// resolver checks in? For now, the latter (nb if this changes, we
			// need to manually set mustache.resolved = false, otherwise we
			// come up against a nasty bug - #271)

			if ( mustache.resolver ) {
				mustache.resolver.teardown();
			}

			mustache.resolver = new ExpressionResolver( mustache, mustache.parentFragment, mustache.descriptor.x, function ( keypath ) {
				mustache.resolve( keypath );
			});
		}

		// normal keypath mustache?
		if ( mustache.keypath ) {
			updated =  getNewKeypath( mustache.keypath, oldKeypath, newKeypath );

			//was a new keypath created?
			if(updated){
				//resolve it
				mustache.resolve( updated );
			}
		}
		// index ref mustache?
		else if ( indexRef !== undefined && mustache.indexRef === indexRef ) {
			mustache.value = newIndex;
			mustache.render( newIndex );
		}

		// otherwise, it's an unresolved reference. the context stack has been updated
		// so it will take care of itself

		// if it's a section mustache, we need to go through any children
		if ( mustache.fragments ) {
			i = mustache.fragments.length;
			while ( i-- ) {
				reassignFragment( mustache.fragments[i], indexRef, newIndex, oldKeypath, newKeypath );
			}
		}
	};

});
