import Binding from './Binding';
import getBindingGroup from './getBindingGroup';
import handleDomEvent from './handleDomEvent';
import noop from '../../../../utils/noop';

function getValue() {
	const checked = this.bindings.filter( b => b.node.checked );
	if ( checked.length > 0 ) {
		return checked[0].element.getAttribute( 'value' );
	}
}

export default class RadioNameBinding extends Binding {
	constructor ( element ) {
		super( element, 'name' );

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
			handleChange: () => this.node.name = `{{${this.model.getKeypath()}}}`,
			rebind: noop
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

	lastVal ( setting, value ) {
		if ( !this.group ) return;
		if ( setting ) this.group.lastValue = value;
		else return this.group.lastValue;
	}

	render () {
		super.render();

		const node = this.node;

		node.name = `{{${this.model.getKeypath()}}}`;
		node.checked = this.element.compare ( this.model.get(), this.element.getAttribute( 'value' ) );

		this.element.on( 'change', handleDomEvent );

		if ( node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
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
		const el = this.element;

		el.off( 'change', handleDomEvent );
		el.off( 'click', handleDomEvent );
	}
}
