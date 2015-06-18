import Binding from './Binding';
import handleDomEvent from './handleDomEvent';

export default class CheckboxBinding extends Binding {
	constructor ( element ) {
		super( element, 'checked' );
	}

	render () {
		super.render();

		this.node.addEventListener( 'change', handleDomEvent, false );

		if ( this.node.attachEvent ) {
			this.node.addEventListener( 'click', handleDomEvent, false );
		}
	}

	unrender () {
		this.node.removeEventListener( 'change', handleDomEvent, false );
		this.node.removeEventListener( 'click', handleDomEvent, false );
	}

	getInitialValue () {
		return !!this.element.getAttribute( 'checked' );
	}

	getValue () {
		return this.node.checked;
	}
}
