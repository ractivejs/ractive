define([
	'config/types',
	'render/shared/utils/assignNewKeypath'
], function (
	types,
	assignNewKeypath
) {

	'use strict';

	return function reassignFragment ( indexRef, newIndex, oldKeypath, newKeypath ) {
		var i, item;

		// If this fragment was rendered with innerHTML, we have nothing to do
		// TODO a less hacky way of determining this
		if ( this.html !== undefined ) {
			return;
		}

		// assign new context keypath if needed
		assignNewKeypath(this, 'context', oldKeypath, newKeypath);

		if ( this.indexRefs
			&& this.indexRefs[ indexRef ] !== undefined
			&& this.indexRefs[ indexRef ] !== newIndex) {
			this.indexRefs[ indexRef ] = newIndex;
		}
		
		this.items.forEach(function(item){
			item.reassign( indexRef, newIndex, oldKeypath, newKeypath );
		});
	};

});
