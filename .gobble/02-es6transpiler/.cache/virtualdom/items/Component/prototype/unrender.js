define(['Ractive/prototype/shared/fireEvent'],function (fireEvent) {

	'use strict';
	
	return function Component$unrender ( shouldDestroy ) {
		fireEvent( this.instance, 'teardown', { reserved: true });
	
		this.shouldDestroy = shouldDestroy;
		this.instance.unrender();
	};

});