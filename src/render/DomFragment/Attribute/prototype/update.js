define([
	'global/runloop',
	'config/namespaces',
	'utils/isArray'
], function (
	runloop,
	namespaces,
	isArray
) {

	'use strict';

	var updateAttribute,

		updateFileInputValue,
		deferSelect,
		initSelect,
		updateSelect,
		updateMultipleSelect,
		updateRadioName,
		updateCheckboxName,
		updateIEStyleAttribute,
		updateClassName,
		updateContentEditableValue,
		updateEverythingElse;

	// There are a few special cases when it comes to updating attributes. For this reason,
	// the prototype .update() method points to updateAttribute, which waits until the
	// attribute has finished initialising, then replaces the prototype method with a more
	// suitable one. That way, we save ourselves doing a bunch of tests on each call
	updateAttribute = function () {
		var node;

		if ( !this.ready ) {
			return this; // avoid items bubbling to the surface when we're still initialising
		}

		node = this.pNode;

		// special case - selects
		if ( node.tagName === 'SELECT' && this.lcName === 'value' ) {
			this.update = deferSelect;
			this.deferredUpdate = initSelect; // we don't know yet if it's a select-one or select-multiple

			return this.update();
		}

		// special case - <input type='file' value='{{fileList}}'>
		if ( this.isFileInputValue ) {
			this.update = updateFileInputValue; // save ourselves the trouble next time
			return this;
		}

		// special case - <input type='radio' name='{{twoway}}' value='foo'>
		if ( this.twoway && this.lcName === 'name' ) {
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
		if ( this.lcName === 'style' && node.style.setAttribute ) {
			this.update = updateIEStyleAttribute;
			return this.update();
		}

		// special case - class names. IE fucks things up, again
		if ( this.lcName === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
			this.update = updateClassName;
			return this.update();
		}

		// special case - contenteditable
		if ( node.getAttribute( 'contenteditable' ) && this.lcName === 'value' ) {
			this.update = updateContentEditableValue;
			return this.update();
		}

		this.update = updateEverythingElse;
		return this.update();
	};

	updateFileInputValue = function () {
		return this; // noop - file inputs are readonly
	};

	initSelect = function () {
		// we're now in a position to decide whether this is a select-one or select-multiple
		this.deferredUpdate = ( this.pNode.multiple ? updateMultipleSelect : updateSelect );
		this.deferredUpdate();
	};

	deferSelect = function () {
		// because select values depend partly on the values of their children, and their
		// children may be entering and leaving the DOM, we wait until updates are
		// complete before updating
		runloop.addSelectValue( this );
		return this;
	};

	updateSelect = function () {
		var value = this.fragment.getValue(), options, option, optionValue, i;

		this.value = this.pNode._ractive.value = value;

		options = this.pNode.options;
		i = options.length;

		while ( i-- ) {
			option = options[i];
			optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive

			if ( optionValue == value ) { // double equals as we may be comparing numbers with strings
				option.selected = true;
				return this;
			}
		}

		// if we're still here, it means the new value didn't match any of the options...
		// TODO figure out what to do in this situation

		return this;
	};

	updateMultipleSelect = function () {
		var value = this.fragment.getValue(), options, i, option, optionValue;

		if ( !isArray( value ) ) {
			value = [ value ];
		}

		options = this.pNode.options;
		i = options.length;

		while ( i-- ) {
			option = options[i];
			optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive
			option.selected = ( value.indexOf( optionValue ) !== -1 );
		}

		this.value = value;

		return this;
	};

	updateRadioName = function () {
		var node, value;

		node = this.pNode;
		value = this.fragment.getValue();

		node.checked = ( value == node._ractive.value );

		return this;
	};

	updateCheckboxName = function () {
		var node, value;

		node = this.pNode;
		value = this.fragment.getValue();

		if ( !isArray( value ) ) {
			node.checked = ( value == node._ractive.value );
			return this;
		}

		node.checked = ( value.indexOf( node._ractive.value ) !== -1 );

		return this;
	};

	updateIEStyleAttribute = function () {
		var node, value;

		node = this.pNode;
		value = this.fragment.getValue();

		if ( value === undefined ) {
			value = '';
		}

		if ( value !== this.value ) {
			node.style.setAttribute( 'cssText', value );
			this.value = value;
		}

		return this;
	};

	updateClassName = function () {
		var node, value;

		node = this.pNode;
		value = this.fragment.getValue();

		if ( value === undefined ) {
			value = '';
		}

		if ( value !== this.value ) {
			node.className = value;
			this.value = value;
		}

		return this;
	};

	updateContentEditableValue = function () {
		var node, value;

		node = this.pNode;
		value = this.fragment.getValue();

		if ( value === undefined ) {
			value = '';
		}

		if ( value !== this.value ) {
			if ( !this.active ) {
				node.innerHTML = value;
			}

			this.value = value;
		}

		return this;
	};

	updateEverythingElse = function () {
		var node, value;

		node = this.pNode;
		value = this.fragment.getValue();

		// store actual value, so it doesn't get coerced to a string
		if ( this.isValueAttribute ) {
			node._ractive.value = value;
		}

		if ( value == undefined ) {
			value = '';
		}

		if ( value !== this.value ) {
			if ( this.useProperty ) {

				// with two-way binding, only update if the change wasn't initiated by the user
				// otherwise the cursor will often be sent to the wrong place
				if ( !this.active ) {
					node[ this.propertyName ] = value;
				}

				this.value = value;

				return this;
			}

			if ( this.namespace ) {
				node.setAttributeNS( this.namespace, this.name, value );
				this.value = value;

				return this;
			}

			if ( this.lcName === 'id' ) {
				if ( this.value !== undefined ) {
					this.root.nodes[ this.value ] = undefined;
				}

				this.root.nodes[ value ] = node;
			}

			node.setAttribute( this.name, value );

			this.value = value;
		}

		return this;
	};

	return updateAttribute;

});
