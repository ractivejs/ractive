define(['Ractive/prototype/shared/fireEvent'],function (fireEvent) {

	'use strict';
	
	return function Ractive$fire ( eventName ) {
	
		var options = {
			args: Array.prototype.slice.call( arguments, 1 )
		};
	
		fireEvent( this, eventName, options );
	};

});