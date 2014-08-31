define(['Ractive/prototype/shared/fireEvent'],function (fireEvent) {

	'use strict';
	
	return function EventHandler$fire ( event ) {
		fireEvent( this.root, this.getAction(), { event: event } );
	};

});