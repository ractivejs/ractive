import Binding from './Binding';
import handleDomEvent from './handleDomEvent';

export default class ContentEditableBinding extends Binding {
	getInitialValue () {
		return this.element.fragment ? this.element.fragment.toString() : '';
	}

	render () {
		super.render();

		const node = this.node;

		node.addEventListener( 'change', handleDomEvent, false );
		node.addEventListener( 'blur', handleDomEvent, false );

		if ( !this.ractive.lazy ) {
			node.addEventListener( 'input', handleDomEvent, false );

			if ( node.attachEvent ) {
				node.addEventListener( 'keyup', handleDomEvent, false );
			}
		}
	}

	unrender () {
		const node = this.node;

		node.removeEventListener( 'blur', handleDomEvent, false );
		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'input', handleDomEvent, false );
		node.removeEventListener( 'keyup', handleDomEvent, false );
	}

	getValue () {
		return this.element.node.innerHTML;
	}
}
