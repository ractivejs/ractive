define(function () {

	'use strict';
	
	return function Section$render () {
		var docFrag;
	
		docFrag = this.docFrag = document.createDocumentFragment();
	
		this.update();
	
		this.rendered = true;
		return docFrag;
	};

});