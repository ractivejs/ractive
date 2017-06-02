import Binding from './Binding';
import handleDomEvent from './handleDomEvent';

export default class CheckboxBinding extends Binding {
	constructor ( element ) {
		super( element, 'checked' );
	}

	render () {
		super.render();

		this.element.on( 'change', handleDomEvent );

		if ( this.node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	}

	unrender () {
		this.element.off( 'change', handleDomEvent );
		this.element.off( 'click', handleDomEvent );
	}

	getInitialValue () {
		return !!this.element.getAttribute( 'checked' );
	}

	getValue () {
		return this.node.checked;
	}

	setFromNode ( node ) {
		this.model.set( node.checked );
	}
}
