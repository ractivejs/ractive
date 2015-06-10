import { namespaces } from 'config/environment';
import noop from 'utils/noop';

import updateSelectValue from './update/updateSelectValue';
import updateMultipleSelectValue from './update/updateMultipleSelectValue';
import updateRadioName from './update/updateRadioName';
import updateRadioValue from './update/updateRadioValue';
import updateCheckboxName from './update/updateCheckboxName';
import updateClassName from './update/updateClassName';
import updateIdAttribute from './update/updateIdAttribute';
import updateIEStyleAttribute from './update/updateIEStyleAttribute';
import updateContentEditableValue from './update/updateContentEditableValue';
import updateValue from './update/updateValue';
import updateBoolean from './update/updateBoolean';
import updateEverythingElse from './update/updateEverythingElse';

// There are a few special cases when it comes to updating attributes. For this reason,
// the prototype .update() method points to this method, which waits until the
// attribute has finished initialising, then replaces the prototype method with a more
// suitable one. That way, we save ourselves doing a bunch of tests on each call
export default function Attribute$update () {
	var { name, element, node } = this, type, updateMethod;

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
	else if ( this.isTwoway && name === 'name' ) {
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
}
