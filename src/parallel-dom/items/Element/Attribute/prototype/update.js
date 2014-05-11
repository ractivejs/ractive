import namespaces from 'config/namespaces';
import noop from 'utils/noop';

import updateSelectValue from 'parallel-dom/items/Element/Attribute/prototype/update/updateSelectValue';
import updateMultipleSelectValue from 'parallel-dom/items/Element/Attribute/prototype/update/updateMultipleSelectValue';
import updateRadioName from 'parallel-dom/items/Element/Attribute/prototype/update/updateRadioName';
import updateCheckboxName from 'parallel-dom/items/Element/Attribute/prototype/update/updateCheckboxName';
import updateClassName from 'parallel-dom/items/Element/Attribute/prototype/update/updateClassName';
import updateIdAttribute from 'parallel-dom/items/Element/Attribute/prototype/update/updateIdAttribute';
import updateIEStyleAttribute from 'parallel-dom/items/Element/Attribute/prototype/update/updateIEStyleAttribute';
import updateContentEditableValue from 'parallel-dom/items/Element/Attribute/prototype/update/updateContentEditableValue';
import updateOptionValue from 'parallel-dom/items/Element/Attribute/prototype/update/updateOptionValue';
import updateValue from 'parallel-dom/items/Element/Attribute/prototype/update/updateValue';
import updateBoolean from 'parallel-dom/items/Element/Attribute/prototype/update/updateBoolean';
import updateEverythingElse from 'parallel-dom/items/Element/Attribute/prototype/update/updateEverythingElse';

// There are a few special cases when it comes to updating attributes. For this reason,
// the prototype .update() method points to updateAttribute, which waits until the
// attribute has finished initialising, then replaces the prototype method with a more
// suitable one. That way, we save ourselves doing a bunch of tests on each call
export default function Attribute$update () {
	var name, element, node;

	name = this.name;
	element = this.element;
	node = this.node;

	if ( name === 'id' ) {
		this.update = updateIdAttribute;
	}

	// special case - selects
	else if ( element.name === 'select' && name === 'value' ) {
		this.update = node.multiple ? updateMultipleSelectValue : updateSelectValue;
	}

	// special case - <input type='file' value='{{fileList}}'>
	else if ( element.name === 'input' && node.type === 'file' && name === 'value' ) {
		this.update = noop; // read-only
	}

	// special case - <input type='radio' name='{{twoway}}' value='foo'>
	else if ( this.twoway && name === 'name' ) {
		if ( node.type === 'radio' ) {
			this.update = updateRadioName;
		}

		else if ( node.type === 'checkbox' ) {
			this.update = updateCheckboxName;
		}
	}

	// special case - style attributes in Internet Exploder
	else if ( name === 'style' && node.style.setAttribute ) {
		this.update = updateIEStyleAttribute;
	}

	// special case - class names. IE fucks things up, again
	else if ( name === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
		this.update = updateClassName;
	}

	// special case - contenteditable
	else if ( node.getAttribute( 'contenteditable' ) && this.name === 'value' ) {
		this.update = updateContentEditableValue;
	}

	else if ( name === 'value' ) {
		if ( element.name === 'option' && element.select.binding ) {
			this.update = updateOptionValue;
		} else {
			this.update = updateValue;
		}
	}

	else if ( this.useProperty ) {
		this.update = updateBoolean;
	}

	else {
		this.update = updateEverythingElse;
	}

	this.update();
}
