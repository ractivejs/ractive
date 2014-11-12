import log from 'utils/log/log';
import ContentEditableBinding from 'virtualdom/items/Element/Binding/ContentEditableBinding';
import RadioBinding from 'virtualdom/items/Element/Binding/RadioBinding';
import RadioNameBinding from 'virtualdom/items/Element/Binding/RadioNameBinding';
import CheckboxNameBinding from 'virtualdom/items/Element/Binding/CheckboxNameBinding';
import CheckboxBinding from 'virtualdom/items/Element/Binding/CheckboxBinding';
import SelectBinding from 'virtualdom/items/Element/Binding/SelectBinding';
import MultipleSelectBinding from 'virtualdom/items/Element/Binding/MultipleSelectBinding';
import FileListBinding from 'virtualdom/items/Element/Binding/FileListBinding';
import NumericBinding from 'virtualdom/items/Element/Binding/NumericBinding';
import GenericBinding from 'virtualdom/items/Element/Binding/GenericBinding';

export default function createTwowayBinding ( element ) {
	var attributes = element.attributes, type, Binding, bindName, bindChecked;

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
				log.error({ message: 'badRadioInputBinding' });
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

	if ( Binding ) {
		return new Binding( element );
	}
}

function isBindable ( attribute ) {
	return attribute && attribute.isBindable;
}
