define(function () {

	'use strict';
	
	return function Fragment$render () {
		var result;
	
		if ( this.items.length === 1 ) {
			result = this.items[0].render();
		} else {
			result = document.createDocumentFragment();
	
			this.items.forEach( function(item ) {
				result.appendChild( item.render() );
			});
		}
	
		this.rendered = true;
		return result;
	};

});