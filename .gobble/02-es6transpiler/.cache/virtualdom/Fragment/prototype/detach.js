define(function () {

	'use strict';
	
	return function Fragment$detach () {
		var docFrag;
	
		if ( this.items.length === 1 ) {
			return this.items[0].detach();
		}
	
		docFrag = document.createDocumentFragment();
	
		this.items.forEach( function(item ) {
			docFrag.appendChild( item.detach() );
		});
	
		return docFrag;
	};

});