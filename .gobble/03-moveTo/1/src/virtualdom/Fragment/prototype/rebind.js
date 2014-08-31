define(['virtualdom/items/shared/utils/assignNewKeypath'],function (assignNewKeypath) {

	'use strict';
	
	return function Fragment$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	
		// assign new context keypath if needed
		assignNewKeypath( this, 'context', oldKeypath, newKeypath );
	
		if ( this.indexRefs && this.indexRefs[ indexRef ] !== undefined ) {
			this.indexRefs[ indexRef ] = newIndex;
		}
	
		this.items.forEach( function(item ) {
			if ( item.rebind ) {
				item.rebind( indexRef, newIndex, oldKeypath, newKeypath );
			}
		});
	};

});