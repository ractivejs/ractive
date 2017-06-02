import Binding from './Binding';
import handleDomEvent from './handleDomEvent';
import { arrayContentsMatch } from '../../../../utils/array';
import getSelectedOptions from '../../../../utils/getSelectedOptions';

export default class MultipleSelectBinding extends Binding {
	getInitialValue () {
		return this.element.options
			.filter( option => option.getAttribute( 'selected' ) )
			.map( option => option.getAttribute( 'value' ) );
	}

	getValue () {
		const options = this.element.node.options;
		const len = options.length;

		const selectedValues = [];

		for ( let i = 0; i < len; i += 1 ) {
			const option = options[i];

			if ( option.selected ) {
				const optionValue = option._ractive ? option._ractive.value : option.value;
				selectedValues.push( optionValue );
			}
		}

		return selectedValues;
	}

	handleChange () {
		const attribute = this.attribute;
		const previousValue = attribute.getValue();

		const value = this.getValue();

		if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
			super.handleChange();
		}

		return this;
	}

	render () {
		super.render();

		this.element.on( 'change', handleDomEvent );

		if ( this.model.get() === undefined ) {
			// get value from DOM, if possible
			this.handleChange();
		}
	}

	setFromNode ( node ) {
		const selectedOptions = getSelectedOptions( node );
		let i = selectedOptions.length;
		const result = new Array( i );

		while ( i-- ) {
			const option = selectedOptions[i];
			result[i] = option._ractive ? option._ractive.value : option.value;
		}

		this.model.set( result );
	}

	unrender () {
		this.element.off( 'change', handleDomEvent );
	}
}
