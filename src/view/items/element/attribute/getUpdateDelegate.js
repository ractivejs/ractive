import { html } from '../../../../config/namespaces';
import { safeToStringValue} from '../../../../utils/dom';
import { arrayContains } from '../../../../utils/array';
import noop from '../../../../utils/noop';
import { readStyle, readClass } from '../../../helpers/specialAttrs';
import hyphenateCamel from '../../../../utils/hyphenateCamel';

const textTypes = [ undefined, 'text', 'search', 'url', 'email', 'hidden', 'password', 'search', 'reset', 'submit' ];

export default function getUpdateDelegate ( attribute ) {
	const { element, name } = attribute;

	if ( name === 'value' ) {
		if ( attribute.interpolator ) attribute.interpolator.bound = true;

		// special case - selects
		if ( element.name === 'select' && name === 'value' ) {
			return element.getAttribute( 'multiple' ) ? updateMultipleSelectValue : updateSelectValue;
		}

		if ( element.name === 'textarea' ) return updateStringValue;

		// special case - contenteditable
		if ( element.getAttribute( 'contenteditable' ) != null ) return updateContentEditableValue;

		// special case - <input>
		if ( element.name === 'input' ) {
			const type = element.getAttribute( 'type' );

			// type='file' value='{{fileList}}'>
			if ( type === 'file' ) return noop; // read-only

			// type='radio' name='{{twoway}}'
			if ( type === 'radio' && element.binding && element.binding.attribute.name === 'name' ) return updateRadioValue;

			if ( ~textTypes.indexOf( type ) ) return updateStringValue;
		}

		return updateValue;
	}

	const node = element.node;

	// special case - <input type='radio' name='{{twoway}}' value='foo'>
	if ( attribute.isTwoway && name === 'name' ) {
		if ( node.type === 'radio' ) return updateRadioName;
		if ( node.type === 'checkbox' ) return updateCheckboxName;
	}

	if ( name === 'style' ) return updateStyleAttribute;

	if ( name.indexOf( 'style-' ) === 0 ) return updateInlineStyle;

	// special case - class names. IE fucks things up, again
	if ( name === 'class' && ( !node.namespaceURI || node.namespaceURI === html ) ) return updateClassName;

	if ( name.indexOf( 'class-' ) === 0 ) return updateInlineClass;

	if ( attribute.isBoolean ) {
		const type = element.getAttribute( 'type' );
		if ( attribute.interpolator && name === 'checked' && ( type === 'checkbox' || type === 'radio' ) ) attribute.interpolator.bound = true;
		return updateBoolean;
	}

	if ( attribute.namespace && attribute.namespace !== attribute.node.namespaceURI ) return updateNamespacedAttribute;

	return updateAttribute;
}

function updateMultipleSelectValue ( reset ) {
	let value = this.getValue();

	if ( !Array.isArray( value ) ) value = [ value ];

	const options = this.node.options;
	let i = options.length;

	if ( reset ) {
		while ( i-- ) options[i].selected = false;
	} else {
		while ( i-- ) {
			const option = options[i];
			const optionValue = option._ractive ?
				option._ractive.value :
				option.value; // options inserted via a triple don't have _ractive

			option.selected = arrayContains( value, optionValue );
		}
	}
}

function updateSelectValue ( reset ) {
	const value = this.getValue();

	if ( !this.locked ) { // TODO is locked still a thing?
		this.node._ractive.value = value;

		const options = this.node.options;
		let i = options.length;
		let wasSelected = false;

		if ( reset ) {
			while ( i-- ) options[i].selected = false;
		} else {
			while ( i-- ) {
				const option = options[i];
				const optionValue = option._ractive ?
					option._ractive.value :
					option.value; // options inserted via a triple don't have _ractive
				if ( option.disabled && option.selected ) wasSelected = true;

				if ( optionValue == value ) { // double equals as we may be comparing numbers with strings
					option.selected = true;
					return;
				}
			}
		}

		if ( !wasSelected ) this.node.selectedIndex = -1;
	}
}


function updateContentEditableValue ( reset ) {
	const value = this.getValue();

	if ( !this.locked ) {
		if ( reset ) this.node.innerHTML = '';
		else this.node.innerHTML = value === undefined ? '' : value;
	}
}

function updateRadioValue ( reset ) {
	const node = this.node;
	const wasChecked = node.checked;

	const value = this.getValue();

	if ( reset ) return node.checked = false;

	//node.value = this.element.getAttribute( 'value' );
	node.value = this.node._ractive.value = value;
	node.checked = this.element.compare( value, this.element.getAttribute( 'name' ) );

	// This is a special case - if the input was checked, and the value
	// changed so that it's no longer checked, the twoway binding is
	// most likely out of date. To fix it we have to jump through some
	// hoops... this is a little kludgy but it works
	if ( wasChecked && !node.checked && this.element.binding && this.element.binding.rendered ) {
		this.element.binding.group.model.set( this.element.binding.group.getValue() );
	}
}

function updateValue ( reset ) {
	if ( !this.locked ) {
		if ( reset ) {
			this.node.removeAttribute( 'value' );
			this.node.value = this.node._ractive.value = null;
		} else {
			const value = this.getValue();

			this.node.value = this.node._ractive.value = value;
			this.node.setAttribute( 'value', safeToStringValue( value ) );
		}
	}
}

function updateStringValue ( reset ) {
	if ( !this.locked ) {
		if ( reset ) {
			this.node._ractive.value = '';
			this.node.removeAttribute( 'value' );
		} else {
			const value = this.getValue();

			this.node._ractive.value = value;

			this.node.value = safeToStringValue( value );
			this.node.setAttribute( 'value', safeToStringValue( value ) );
		}
	}
}

function updateRadioName ( reset ) {
	if ( reset ) this.node.checked = false;
	else this.node.checked = this.element.compare( this.getValue(), this.element.binding.getValue() );
}

function updateCheckboxName ( reset ) {
	const { element, node } = this;
	const binding = element.binding;

	const value = this.getValue();
	const valueAttribute = element.getAttribute( 'value' );

	if ( reset ) {
		// TODO: WAT?
	}

	if ( !Array.isArray( value ) ) {
		binding.isChecked = node.checked = element.compare( value, valueAttribute );
	} else {
		let i = value.length;
		while ( i-- ) {
			if ( element.compare ( valueAttribute, value[i] ) ) {
				binding.isChecked = node.checked = true;
				return;
			}
		}
		binding.isChecked = node.checked = false;
	}
}

function updateStyleAttribute ( reset ) {
	const props = reset ? {} : readStyle( this.getValue() || '' );
	const style = this.node.style;
	const keys = Object.keys( props );
	const prev = this.previous || [];

	let i = 0;
	while ( i < keys.length ) {
		if ( keys[i] in style ) {
			const safe = props[ keys[i] ].replace( '!important', '' );
			style.setProperty( keys[i], safe, safe.length !== props[ keys[i] ].length ? 'important' : '' );
		}
		i++;
	}

	// remove now-missing attrs
	i = prev.length;
	while ( i-- ) {
		if ( !~keys.indexOf( prev[i] ) && prev[i] in style ) style.setProperty( prev[i], '', '' );
	}

	this.previous = keys;
}

function updateInlineStyle ( reset ) {
	if ( !this.style ) {
		this.style = hyphenateCamel( this.name.substr( 6 ) );
	}

	if ( reset && this.node.style.getPropertyValue( this.style ) !== this.last ) return;

	const value = reset ? '' : safeToStringValue( this.getValue() );
	const safe = value.replace( '!important', '' );
	this.node.style.setProperty( this.style, safe, safe.length !== value.length ? 'important' : '' );
	this.last = safe;
}

function updateClassName ( reset ) {
	const value = reset ? [] : readClass( safeToStringValue( this.getValue() ) );

	// watch out for werdo svg elements
	let cls = this.node.className;
	cls = cls.baseVal !== undefined ? cls.baseVal : cls;

	const attr = readClass( cls );
	const prev = this.previous || attr.slice( 0 );

	const className = value.concat( attr.filter( c => !~prev.indexOf( c ) ) ).join( ' ' );

	if ( className !== cls ) {
		if ( typeof this.node.className !== 'string' ) {
			this.node.className.baseVal = className;
		} else {
			this.node.className = className;
		}
	}

	this.previous = value;
}

function updateInlineClass ( reset ) {
	const name = this.name.substr( 6 );

	// watch out for werdo svg elements
	let cls = this.node.className;
	cls = cls.baseVal !== undefined ? cls.baseVal : cls;

	const attr = readClass( cls );
	const value = reset ? false : this.getValue();

	if ( !this.inlineClass ) this.inlineClass = name;

	if ( value && !~attr.indexOf( name ) ) attr.push( name );
	else if ( !value && ~attr.indexOf( name ) ) attr.splice( attr.indexOf( name ), 1 );

	if ( typeof this.node.className !== 'string' ) {
		this.node.className.baseVal = attr.join( ' ' );
	} else {
		this.node.className = attr.join( ' ' );
	}
}

function updateBoolean ( reset ) {
	// with two-way binding, only update if the change wasn't initiated by the user
	// otherwise the cursor will often be sent to the wrong place
	if ( !this.locked ) {
		if ( reset ) {
			if ( this.useProperty ) this.node[ this.propertyName ] = false;
			this.node.removeAttribute( this.propertyName );
		} else {
			if ( this.useProperty ) {
				this.node[ this.propertyName ] = this.getValue();
			} else {
				const val = this.getValue();
				if ( val ) {
					this.node.setAttribute( this.propertyName, typeof val === 'string' ? val : '' );
				} else {
					this.node.removeAttribute( this.propertyName );
				}
			}
		}
	}
}

function updateAttribute ( reset ) {
	if ( reset ) this.node.removeAttribute( this.name );
	else this.node.setAttribute( this.name, safeToStringValue( this.getString() ) );
}

function updateNamespacedAttribute ( reset ) {
	if ( reset ) this.node.removeAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ) );
	else this.node.setAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ), safeToStringValue( this.getString() ) );
}
