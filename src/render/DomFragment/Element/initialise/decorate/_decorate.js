define([
	'state/scheduler',
	'render/DomFragment/Element/initialise/decorate/Decorator'
], function (
	scheduler,
	Decorator
) {

	'use strict';

	return function ( descriptor, root, owner ) {
		owner.decorator = new Decorator( descriptor, root, owner );

		if ( owner.decorator.fn ) {
			scheduler.addDecorator( owner.decorator );
		}
	};

});
