define([
	'render/DomFragment/Element/initialise/decorate/Decorator'
], function (
	Decorator
) {

	'use strict';

	return function ( descriptor, root, owner, contextStack ) {
		owner.decorator = new Decorator( descriptor, root, owner, contextStack );

		if ( owner.decorator.fn ) {
			root._deferred.decorators.push( owner.decorator );
		}
	};

});
