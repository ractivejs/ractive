import Binding from './Binding';
import getBindingGroup from './getBindingGroup';
import handleDomEvent from './handleDomEvent';

function getValue() {
	const checked = this.bindings.filter( b => b.node.checked );
	if ( checked.length > 0 ) {
		return checked[0].element.getAttribute( 'value' );
	}
}

export default class RadioNameBinding extends Binding {
	constructor ( element ) {
		if ( super( element, 'name' ) === false ) return false;

		this.group = getBindingGroup( 'radioname', this.model, getValue );
		this.group.add( this );

		if ( element.checked ) {
			this.group.value = this.getValue();
		}
	}

	bind () {
		if ( !this.group.bound ) {
			this.group.bind();
		}

		// update name keypath when necessary
		this.nameAttributeBinding = {
			handleChange: () => this.node.name = `{{${this.model.getKeypath()}}}`
		};

		this.model.getKeypathModel().register( this.nameAttributeBinding );
	}

	getInitialValue () {
		if ( this.element.getAttribute( 'checked' ) ) {
			return this.element.getAttribute( 'value' );
		}
	}

	getValue () {
		return this.element.getAttribute( 'value' );
	}

	handleChange () {
		// If this <input> is the one that's checked, then the value of its
		// `name` model gets set to its value
		if ( this.node.checked ) {
			this.group.value = this.getValue();
			super.handleChange();
		}
	}

	render () {
		super.render();

		const node = this.node;

		node.name = `{{${this.model.getKeypath()}}}`;
		node.checked = this.model.get() == this.element.getAttribute( 'value' );

		node.addEventListener( 'change', handleDomEvent, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'click', handleDomEvent, false );
		}
	}

	setFromNode ( node ) {
		if ( node.checked ) {
			this.group.model.set( this.element.getAttribute( 'value' ) );
		}
	}

	unbind () {
		this.group.remove( this );

		this.model.getKeypathModel().unregister( this.nameAttributeBinding );
	}

	unrender () {
		const node = this.node;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'click', handleDomEvent, false );
	}
}
