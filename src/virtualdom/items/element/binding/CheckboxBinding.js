import Binding from './Binding';
import handleDomEvent from './handleDomEvent';

export default class CheckboxBinding extends Binding {
	constructor ( element ) {
		super( element, 'checked' );
	}

	render () {
		this.node = this.element.node;

		this.node.addEventListener( 'change', handleDomEvent, false );

		if ( this.node.attachEvent ) {
			this.node.addEventListener( 'click', handleDomEvent, false );
		}
	}

	unrender () {
		this.node.removeEventListener( 'change', handleDomEvent, false );
		this.node.removeEventListener( 'click', handleDomEvent, false );
	}

	getValue () {
		return this.ement.node.checked;
	}
}
