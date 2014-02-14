define([
	'global/runloop',
	'render/DomFragment/Element/initialise/decorate/Decorator'
], function (
	runloop,
	Decorator
) {

	'use strict';

	return function ( descriptor, root, owner ) {
		owner.decorator = new Decorator( descriptor, root, owner );

		if ( owner.decorator.fn ) {
			runloop.addDecorator( owner.decorator );
		}
	};

});
