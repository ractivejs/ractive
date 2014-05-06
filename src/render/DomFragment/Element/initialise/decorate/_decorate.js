import runloop from 'global/runloop';
import Decorator from 'render/DomFragment/Element/initialise/decorate/Decorator';

export default function ( descriptor, root, owner ) {
    var decorator = new Decorator( descriptor, root, owner );

    if ( decorator.fn ) {
        owner.decorator = decorator;
        runloop.addDecorator( owner.decorator );
    }
};
