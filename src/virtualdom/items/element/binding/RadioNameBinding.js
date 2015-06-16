import Binding from './Binding';
import { removeFromArray } from 'utils/array';
import getSiblings from './getSiblings';
import handleDomEvent from './handleDomEvent';

export default class RadioNameBinding extends Binding {
	constructor ( element ) {
		super( element, 'name' );

		this.siblings = getSiblings( this.ractive._guid, 'radioname', this.model.getKeypath() );
		this.siblings.push( this );

		this.radioName = true; // so that ractive.updateModel() knows what to do with this
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
			super.handleChange();
		}
	}

	// TODO still necessary?
	rebound ( oldKeypath, newKeypath ) {
		super.rebound( oldKeypath, newKeypath );

		if ( this.rendered ) {
			this.node.name = '{{' + this.model.getKeypath() + '}}';
		}
	}

	render () {
		super.render();
		
		const node = this.node;

		node.name = '{{' + this.model.getKeypath() + '}}';
		node.checked = this.model.value == this.element.getAttribute( 'value' );

		node.addEventListener( 'change', handleDomEvent, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'click', handleDomEvent, false );
		}
	}

	unbind () {
		removeFromArray( this.siblings, this );
	}

	unrender () {
		var node = this.node;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'click', handleDomEvent, false );
	}
}
