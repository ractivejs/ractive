import { INTERPOLATOR } from '../../../../config/types';
import { warnIfDebug } from '../../../../utils/log';
import Binding from './Binding';
import CheckboxBinding from './CheckboxBinding';
import CheckboxNameBinding from './CheckboxNameBinding';
import ContentEditableBinding from './ContentEditableBinding';
import GenericBinding from './GenericBinding';
import MultipleSelectBinding from './MultipleSelectBinding';
import NumericBinding from './NumericBinding';
import RadioBinding from './RadioBinding';
import RadioNameBinding from './RadioNameBinding';
import SingleSelectBinding from './SingleSelectBinding';

function isBindable ( attribute ) {
	return attribute &&
	       attribute.template.length === 1 &&
	       attribute.template[0].t === INTERPOLATOR &&
	       !attribute.template[0].s;
}

export default function selectBinding ( element ) {
	const attributes = element.attributeByName;

	// contenteditable - bind if the contenteditable attribute is true
	// or is bindable and may thus become true...
	if ( element.getAttribute( 'contenteditable' ) || isBindable( attributes.contenteditable ) ) {
		// ...and this element also has a value attribute to bind
		return isBindable( attributes.value ) ? ContentEditableBinding : null;
	}

	// <input>
	if ( element.name === 'input' ) {
		const type = element.getAttribute( 'type' );

		if ( type === 'radio' || type === 'checkbox' ) {
			const bindName = isBindable( attributes.name );
			const bindChecked = isBindable( attributes.checked );

			// we can either bind the name attribute, or the checked attribute - not both
			if ( bindName && bindChecked ) {
				warnIfDebug( 'A radio input can have two-way binding on its name attribute, or its checked attribute - not both', { ractive: element.root });
			}

			if ( bindName ) {
				return type === 'radio' ? RadioNameBinding : CheckboxNameBinding;
			}

			if ( bindChecked ) {
				return type === 'radio' ? RadioBinding : CheckboxBinding;
			}
		}

		if ( type === 'file' && isBindable( attributes.value ) ) {
			return Binding;
		}

		if ( isBindable( attributes.value ) ) {
			return ( type === 'number' || type === 'range' ) ? NumericBinding : GenericBinding;
		}

		return null;
	}

	// <select>
	if ( element.name === 'select' && isBindable( attributes.value ) ) {
		return element.getAttribute( 'multiple' ) ? MultipleSelectBinding : SingleSelectBinding;
	}

	// <textarea>
	if ( element.name === 'textarea' && isBindable( attributes.value ) ) {
		return GenericBinding;
	}
}
