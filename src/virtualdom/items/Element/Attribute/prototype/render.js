import { namespaces } from 'config/environment';

// the property name equivalents for element attributes, where they differ
// from the lowercased attribute name
var propertyNames = {
	'accept-charset': 'acceptCharset',
	'accesskey': 'accessKey',
	'bgcolor': 'bgColor',
	'class': 'className',
	'codebase': 'codeBase',
	'colspan': 'colSpan',
	'contenteditable': 'contentEditable',
	'datetime': 'dateTime',
	'dirname': 'dirName',
	'for': 'htmlFor',
	'http-equiv': 'httpEquiv',
	'ismap': 'isMap',
	'maxlength': 'maxLength',
	'novalidate': 'noValidate',
	'pubdate': 'pubDate',
	'readonly': 'readOnly',
	'rowspan': 'rowSpan',
	'tabindex': 'tabIndex',
	'usemap': 'useMap'
};

export default function Attribute$render ( node ) {
	var propertyName;

	this.node = node;

	// should we use direct property access, or setAttribute?
	if ( !node.namespaceURI || node.namespaceURI === namespaces.html ) {
		propertyName = propertyNames[ this.name ] || this.name;

		if ( node[ propertyName ] !== undefined ) {
			this.propertyName = propertyName;
		}

		// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
		// node.selected = true rather than node.setAttribute( 'selected', '' )
		if ( this.isBoolean || this.isTwoway ) {
			this.useProperty = true;
		}

		if ( propertyName === 'value' ) {
			node._ractive.value = this.value;
		}
	}

	this.rendered = true;
	this.update();
}
