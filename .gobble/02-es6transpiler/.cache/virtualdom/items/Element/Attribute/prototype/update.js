define(['config/namespaces','utils/noop','virtualdom/items/Element/Attribute/prototype/update/updateSelectValue','virtualdom/items/Element/Attribute/prototype/update/updateMultipleSelectValue','virtualdom/items/Element/Attribute/prototype/update/updateRadioName','virtualdom/items/Element/Attribute/prototype/update/updateRadioValue','virtualdom/items/Element/Attribute/prototype/update/updateCheckboxName','virtualdom/items/Element/Attribute/prototype/update/updateClassName','virtualdom/items/Element/Attribute/prototype/update/updateIdAttribute','virtualdom/items/Element/Attribute/prototype/update/updateIEStyleAttribute','virtualdom/items/Element/Attribute/prototype/update/updateContentEditableValue','virtualdom/items/Element/Attribute/prototype/update/updateValue','virtualdom/items/Element/Attribute/prototype/update/updateBoolean','virtualdom/items/Element/Attribute/prototype/update/updateEverythingElse'],function (namespaces, noop, updateSelectValue, updateMultipleSelectValue, updateRadioName, updateRadioValue, updateCheckboxName, updateClassName, updateIdAttribute, updateIEStyleAttribute, updateContentEditableValue, updateValue, updateBoolean, updateEverythingElse) {

	'use strict';
	
	return function Attribute$update () {
		var name, element, node, type, updateMethod;
	
		name = this.name;
		element = this.element;
		node = this.node;
	
		if ( name === 'id' ) {
			updateMethod = updateIdAttribute;
		}
	
		else if ( name === 'value' ) {
			// special case - selects
			if ( element.name === 'select' && name === 'value' ) {
				updateMethod = element.getAttribute( 'multiple' ) ? updateMultipleSelectValue : updateSelectValue;
			}
	
			else if ( element.name === 'textarea' ) {
				updateMethod = updateValue;
			}
	
			// special case - contenteditable
			else if ( element.getAttribute( 'contenteditable' ) != null ) {
				updateMethod = updateContentEditableValue;
			}
	
			// special case - <input>
			else if ( element.name === 'input' ) {
				type = element.getAttribute( 'type' );
	
				// type='file' value='{{fileList}}'>
				if ( type === 'file' ) {
					updateMethod = noop; // read-only
				}
	
				// type='radio' name='{{twoway}}'
				else if ( type === 'radio' && element.binding && element.binding.name === 'name' ) {
					updateMethod = updateRadioValue;
				}
	
				else {
					updateMethod = updateValue;
				}
			}
		}
	
		// special case - <input type='radio' name='{{twoway}}' value='foo'>
		else if ( this.twoway && name === 'name' ) {
			if ( node.type === 'radio' ) {
				updateMethod = updateRadioName;
			}
	
			else if ( node.type === 'checkbox' ) {
				updateMethod = updateCheckboxName;
			}
		}
	
		// special case - style attributes in Internet Exploder
		else if ( name === 'style' && node.style.setAttribute ) {
			updateMethod = updateIEStyleAttribute;
		}
	
		// special case - class names. IE fucks things up, again
		else if ( name === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
			updateMethod = updateClassName;
		}
	
		else if ( this.useProperty ) {
			updateMethod = updateBoolean;
		}
	
		if ( !updateMethod ) {
			updateMethod = updateEverythingElse;
		}
	
		this.update = updateMethod;
		this.update();
	};

});