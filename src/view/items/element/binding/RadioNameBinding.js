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
		super( element, 'name' );

		this.group = getBindingGroup( 'radioname', this.model, getValue );
		this.group.add( this );

		if ( element.checked ) {
			this.group.value = this.getValue();
		}

		this.attribute.interpolator.pathChanged = () => this.updateName();
	}

	bind () {
		if ( !this.group.bound ) {
			this.group.bind();
		}
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

		this.updateName();
	}

	lastVal ( setting, value ) {
		if ( !this.group ) return;
		if ( setting ) this.group.lastValue = value;
		else return this.group.lastValue;
	}

	rebind ( next, previous ) {
		super.rebind( next, previous );
		this.updateName();
	}

	render () {
		super.render();

		const node = this.node;

		this.updateName();
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
	}

	unrender () {
		const el = this.element;

		el.off( 'change', handleDomEvent );
		el.off( 'click', handleDomEvent );
	}

	updateName () {
		if ( this.node ) this.node.name = `{{${this.model.getKeypath()}}}`;
	}
}
