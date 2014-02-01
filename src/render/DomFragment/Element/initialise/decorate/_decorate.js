define([
	'state/scheduler',
	'render/DomFragment/Element/initialise/decorate/Decorator'
], function (
	scheduler,
	Decorator
) {

	'use strict';

	return function ( descriptor, root, owner, contextStack ) {
		owner.decorator = new Decorator( descriptor, root, owner, contextStack );

		if ( owner.decorator.fn ) {
			scheduler.addDecorator( owner.decorator );
		}
	};

});
