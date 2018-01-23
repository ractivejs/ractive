import Binding from './Binding';
import getBindingGroup from './getBindingGroup';
import handleDomEvent from './handleDomEvent';

const push = [].push;

function getValue() {
	const all = this.bindings.filter(b => b.node && b.node.checked).map(b => b.element.getAttribute( 'value' ));
	const res = [];
	all.forEach(v => { if ( !this.bindings[0].arrayContains( res, v ) ) res.push( v ); });
	return res;
}

export default class CheckboxNameBinding extends Binding {
	constructor ( element ) {
		super( element, 'name' );

		this.checkboxName = true; // so that ractive.updateModel() knows what to do with this

		// Each input has a reference to an array containing it and its
		// group, as two-way binding depends on being able to ascertain
		// the status of all inputs within the group
		this.group = getBindingGroup( 'checkboxes', this.model, getValue );
		this.group.add( this );

		if ( this.noInitialValue ) {
			this.group.noInitialValue = true;
		}

		// If no initial value was set, and this input is checked, we
		// update the model
		if ( this.group.noInitialValue && this.element.getAttribute( 'checked' ) ) {
			const existingValue = this.model.get();
			const bindingValue = this.element.getAttribute( 'value' );

			if ( !this.arrayContains( existingValue, bindingValue ) ) {
				push.call( existingValue, bindingValue ); // to avoid triggering runloop with array adaptor
			}
		}
	}

	bind () {
		if ( !this.group.bound ) {
			this.group.bind();
		}
	}

	getInitialValue () {
		// This only gets called once per group (of inputs that
		// share a name), because it only gets called if there
		// isn't an initial value. By the same token, we can make
		// a note of that fact that there was no initial value,
		// and populate it using any `checked` attributes that
		// exist (which users should avoid, but which we should
		// support anyway to avoid breaking expectations)
		this.noInitialValue = true; // TODO are noInitialValue and wasUndefined the same thing?
		return [];
	}

	getValue () {
		return this.group.value;
	}

	handleChange () {
		this.isChecked = this.element.node.checked;
		this.group.value = this.model.get();
		const value = this.element.getAttribute( 'value' );
		if ( this.isChecked && !this.arrayContains( this.group.value, value ) ) {
			this.group.value.push( value );
		} else if ( !this.isChecked && this.arrayContains( this.group.value, value ) ) {
			this.removeFromArray( this.group.value, value );
		}
		// make sure super knows there's a change
		this.lastValue = null;
		super.handleChange();
	}

	render () {
		super.render();

		const node = this.node;

		const existingValue = this.model.get();
		const bindingValue = this.element.getAttribute( 'value' );

		if ( Array.isArray( existingValue ) ) {
			this.isChecked = this.arrayContains( existingValue, bindingValue );
		} else {
			this.isChecked = this.element.compare( existingValue, bindingValue );
		}
		node.name = '{{' + this.model.getKeypath() + '}}';
		node.checked = this.isChecked;

		this.element.on( 'change', handleDomEvent );

		// in case of IE emergency, bind to click event as well
		if ( this.node.attachEvent ) {
			this.element.on( 'click', handleDomEvent );
		}
	}

	setFromNode ( node ) {
		this.group.bindings.forEach( binding => binding.wasUndefined = true );

		if ( node.checked ) {
			const valueSoFar = this.group.getValue();
			valueSoFar.push( this.element.getAttribute( 'value' ) );

			this.group.model.set( valueSoFar );
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

	arrayContains ( selectValue, optionValue ) {
		let i = selectValue.length;
		while ( i-- ) {
			if ( this.element.compare( optionValue, selectValue[i] ) ) return true;
		}
		return false;
	}

	removeFromArray ( array, item ) {
		if (!array) return;
		let i = array.length;
		while( i-- ) {
			if ( this.element.compare( item, array[i] ) ) {
				array.splice( i, 1 );
			}
		}
	}
}
