import { warn } from 'utils/log';
import ContentEditableBinding from '../../Binding/ContentEditableBinding';
import RadioBinding from '../../Binding/RadioBinding';
import RadioNameBinding from '../../Binding/RadioNameBinding';
import CheckboxNameBinding from '../../Binding/CheckboxNameBinding';
import CheckboxBinding from '../../Binding/CheckboxBinding';
import SelectBinding from '../../Binding/SelectBinding';
import MultipleSelectBinding from '../../Binding/MultipleSelectBinding';
import FileListBinding from '../../Binding/FileListBinding';
import NumericBinding from '../../Binding/NumericBinding';
import GenericBinding from '../../Binding/GenericBinding';

export default function createTwowayBinding ( element ) {
	var attributes = element.attributes, type, Binding, bindName, bindChecked, binding;

	// if this is a late binding, and there's already one, it
	// needs to be torn down
	if ( element.binding ) {
		element.binding.teardown();
		element.binding = null;
	}

	// contenteditable
	if (
		// if the contenteditable attribute is true or is bindable and may thus become true
		( element.getAttribute( 'contenteditable' ) || ( !!attributes.contenteditable && isBindable( attributes.contenteditable ) ) )
		// and this element also has a value attribute to bind
		&& isBindable( attributes.value )
	) {
		Binding = ContentEditableBinding;
	}

	// <input>
	else if ( element.name === 'input' ) {
		type = element.getAttribute( 'type' );

		if ( type === 'radio' || type === 'checkbox' ) {
			bindName = isBindable( attributes.name );
			bindChecked = isBindable( attributes.checked );

			// we can either bind the name attribute, or the checked attribute - not both
			if ( bindName && bindChecked ) {
				warn( 'A radio input can have two-way binding on its name attribute, or its checked attribute - not both' );
			}

			if ( bindName ) {
				Binding = ( type === 'radio' ? RadioNameBinding : CheckboxNameBinding );
			}

			else if ( bindChecked ) {
				Binding = ( type === 'radio' ? RadioBinding : CheckboxBinding );
			}
		}

		else if ( type === 'file' && isBindable( attributes.value ) ) {
			Binding = FileListBinding;
		}

		else if ( isBindable( attributes.value ) ) {
			Binding = ( type === 'number' || type === 'range' ) ? NumericBinding : GenericBinding;
		}
	}

	// <select>
	else if ( element.name === 'select' && isBindable( attributes.value ) ) {
		Binding = ( element.getAttribute( 'multiple' ) ? MultipleSelectBinding : SelectBinding );
	}

	// <textarea>
	else if ( element.name === 'textarea' && isBindable( attributes.value ) ) {
		Binding = GenericBinding;
	}

	if ( Binding && ( binding = new Binding( element ) ) && binding.keypath ) {
		return binding;
	}
}

function isBindable ( attribute ) {
	return attribute && attribute.isBindable;
}
