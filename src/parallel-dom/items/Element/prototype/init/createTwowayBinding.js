import ContentEditableBinding from 'parallel-dom/items/Element/Binding/ContentEditableBinding';
import RadioNameBinding from 'parallel-dom/items/Element/Binding/RadioNameBinding';
import CheckboxNameBinding from 'parallel-dom/items/Element/Binding/CheckboxNameBinding';
import CheckedBinding from 'parallel-dom/items/Element/Binding/CheckedBinding';
import SelectBinding from 'parallel-dom/items/Element/Binding/SelectBinding';
import MultipleSelectBinding from 'parallel-dom/items/Element/Binding/MultipleSelectBinding';
import FileListBinding from 'parallel-dom/items/Element/Binding/FileListBinding';
import GenericBinding from 'parallel-dom/items/Element/Binding/GenericBinding';

export default function createTwowayBinding ( element, attributes ) {
	var attributes = element.attributes, type, Binding;

	// if this is a late binding, and there's already one, it
	// needs to be torn down
	if ( element.binding ) {
		element.binding.teardown();
		element.binding = null;
	}

	// contenteditable
	if ( element.getAttribute( 'contenteditable' ) && isBindable( attributes.value ) ) {
		Binding = ContentEditableBinding;
	}

	// <input>
	else if ( element.name === 'input' ) {
		type = element.getAttribute( 'type' );

		if ( type === 'radio' || type === 'checkbox' ) {
			// we can either bind the name attribute, or the checked attribute - not both
			if ( isBindable( attributes.name ) ) {
				Binding = ( type === 'radio' ? RadioNameBinding : CheckboxNameBinding );
			}

			if ( isBindable( attributes.checked ) ) {
				Binding = CheckedBinding;
			}
		}

		else if ( type === 'file' ) {
			Binding = FileListBinding;
		}

		else if ( isBindable( attributes.value ) ) {
			Binding = GenericBinding;
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
