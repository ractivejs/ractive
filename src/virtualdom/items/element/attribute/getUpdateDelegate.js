import { safeToStringValue } from 'utils/dom';

export default function getUpdateDelegate ({ element, name, template }) {
	if ( name === 'id' ) return updateId;

	if ( typeof template === 'boolean' ) return setProperty;
	if ( typeof template === 'string' ) return setAttribute;

	// TODO all the other finicky types

	return setAttribute;
}

function updateId ( value ) {
	var { node } = this;

	this.ractive.nodes[ value ] = node;
	node.id = value;
}

function setProperty ( value ) {
	this.element.node[ this.name ] = value;
}

function setAttribute ( value ) {
	this.node.setAttribute( this.name, safeToStringValue( value ) );
}
