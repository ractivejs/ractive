define(['utils/log','virtualdom/items/Element/Binding/ContentEditableBinding','virtualdom/items/Element/Binding/RadioBinding','virtualdom/items/Element/Binding/RadioNameBinding','virtualdom/items/Element/Binding/CheckboxNameBinding','virtualdom/items/Element/Binding/CheckboxBinding','virtualdom/items/Element/Binding/SelectBinding','virtualdom/items/Element/Binding/MultipleSelectBinding','virtualdom/items/Element/Binding/FileListBinding','virtualdom/items/Element/Binding/NumericBinding','virtualdom/items/Element/Binding/GenericBinding'],function (log, ContentEditableBinding, RadioBinding, RadioNameBinding, CheckboxNameBinding, CheckboxBinding, SelectBinding, MultipleSelectBinding, FileListBinding, NumericBinding, GenericBinding) {

	'use strict';
	
	var __export;
	
	__export = function createTwowayBinding ( element ) {
		var attributes = element.attributes, type, Binding, bindName, bindChecked;
	
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
	};
	
	function isBindable ( attribute ) {
		return attribute && attribute.isBindable;
	}
	return __export;

});