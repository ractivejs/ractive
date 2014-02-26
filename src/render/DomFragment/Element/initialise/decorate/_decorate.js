define([
	'global/runloop',
	'render/DomFragment/Element/initialise/decorate/Decorator'
], function (
	runloop,
	Decorator
) {

	'use strict';

	return function ( descriptor, root, owner ) {
		var decorator = new Decorator( descriptor, root, owner );

		if ( decorator.fn ) {
			owner.decorator = decorator;
			runloop.addDecorator( owner.decorator );
		}
	};

});
