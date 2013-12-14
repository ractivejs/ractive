define([
	'render/DomFragment/Element/initialise/decorate/Decorator'
], function (
	Decorator
) {
	
	'use strict';

	return function ( descriptor, root, owner, contextStack ) {
		owner.decorator = new Decorator( descriptor, root, owner, contextStack );
		root._deferred.decorators.push( owner.decorator );
	};

});