import runloop from 'global/runloop';
import namespaces from 'config/namespaces';

import updateSelect from 'parallel-dom/items/Element/Attribute/prototype/update/updateSelect';
import updateMultipleSelect from 'parallel-dom/items/Element/Attribute/prototype/update/updateMultipleSelect';
import updateRadioName from 'parallel-dom/items/Element/Attribute/prototype/update/updateRadioName';
import updateCheckboxName from 'parallel-dom/items/Element/Attribute/prototype/update/updateCheckboxName';
import updateClassName from 'parallel-dom/items/Element/Attribute/prototype/update/updateClassName';
import updateIdAttribute from 'parallel-dom/items/Element/Attribute/prototype/update/updateIdAttribute';
import updateIEStyleAttribute from 'parallel-dom/items/Element/Attribute/prototype/update/updateIEStyleAttribute';
import updateContentEditableValue from 'parallel-dom/items/Element/Attribute/prototype/update/updateContentEditableValue';
import updateEverythingElse from 'parallel-dom/items/Element/Attribute/prototype/update/updateEverythingElse';

var deferSelect, initSelect;

initSelect = function () {
	// we're now in a position to decide whether this is a select-one or select-multiple
	this.deferredUpdate = ( this.node.multiple ? updateMultipleSelect : updateSelect );
	this.deferredUpdate();
};

deferSelect = function () {
	// because select values depend partly on the values of their children, and their
	// children may be entering and leaving the DOM, we wait until updates are
	// complete before updating
	runloop.addSelectValue( this );
	return this;
};

// There are a few special cases when it comes to updating attributes. For this reason,
// the prototype .update() method points to updateAttribute, which waits until the
// attribute has finished initialising, then replaces the prototype method with a more
// suitable one. That way, we save ourselves doing a bunch of tests on each call
export default function Attribute$update () {
	var node;

	node = this.node;

	if ( this.name === 'id' ) {
		this.update = updateIdAttribute;
		this.update();
		return;
	}

	// special case - selects
	if ( node.tagName === 'SELECT' && this.name === 'value' ) {
		this.update = deferSelect;
		this.deferredUpdate = initSelect; // we don't know yet if it's a select-one or select-multiple

		return this.update();
	}

	// special case - <input type='file' value='{{fileList}}'>
	if ( this.isFileInputValue ) {
		this.update = noop; // read-only
		return;
	}

	// special case - <input type='radio' name='{{twoway}}' value='foo'>
	if ( this.twoway && this.name === 'name' ) {
		if ( node.type === 'radio' ) {
			this.update = updateRadioName;
			return this.update();
		}

		if ( node.type === 'checkbox' ) {
			this.update = updateCheckboxName;
			return this.update();
		}
	}

	// special case - style attributes in Internet Exploder
	if ( this.name === 'style' && node.style.setAttribute ) {
		this.update = updateIEStyleAttribute;
		return this.update();
	}

	// special case - class names. IE fucks things up, again
	if ( this.name === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
		this.update = updateClassName;
		return this.update();
	}

	// special case - contenteditable
	if ( node.getAttribute( 'contenteditable' ) && this.name === 'value' ) {
		this.update = updateContentEditableValue;
		return this.update();
	}

	this.update = updateEverythingElse;
	return this.update();
}
