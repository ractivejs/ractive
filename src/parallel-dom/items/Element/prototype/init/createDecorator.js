import runloop from 'global/runloop';
import Decorator from 'parallel-dom/items/Element/initialise/decorate/Decorator';

export default function ( template, root, owner ) {
	var decorator = new Decorator( template, root, owner );

	if ( decorator.fn ) {
		owner.decorator = decorator;
		runloop.addDecorator( owner.decorator );
	}
}


export default function createDecorator ( template, root, owner ) {
	var decorator = new Decorator( template, root, owner );
}
