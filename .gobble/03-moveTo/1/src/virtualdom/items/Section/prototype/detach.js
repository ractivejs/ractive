define(function () {

	'use strict';
	
	return function Section$detach () {
		var docFrag;
	
		if ( this.fragments.length === 1 ) {
			return this.fragments[0].detach();
		}
	
		docFrag = document.createDocumentFragment();
	
		this.fragments.forEach( function(item ) {
			docFrag.appendChild( item.detach() );
		});
	
		return docFrag;
	};

});