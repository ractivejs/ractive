import Binding from './Binding';
import handleDomEvent from './handleDomEvent';

export default class ContentEditableBinding extends Binding {
	getInitialValue () {
		return this.element.fragment ? this.element.fragment.toString() : '';
	}

	getValue () {
		return this.element.node.innerHTML;
	}

	render () {
		super.render();

		const el = this.element;

		el.on( 'change', handleDomEvent );
		el.on( 'blur', handleDomEvent );

		if ( !this.ractive.lazy ) {
			el.on( 'input', handleDomEvent );

			if ( this.node.attachEvent ) {
				el.on( 'keyup', handleDomEvent );
			}
		}
	}

	setFromNode ( node ) {
		this.model.set( node.innerHTML );
	}

	unrender () {
		const el = this.element;

		el.off( 'blur', handleDomEvent );
		el.off( 'change', handleDomEvent );
		el.off( 'input', handleDomEvent );
		el.off( 'keyup', handleDomEvent );
	}
}
