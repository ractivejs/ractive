import { safeToStringValue } from 'utils/dom';

export default function getUpdateDelegate ({ element, name, template }) {
	if ( name === 'id' ) return updateId;

	if ( typeof template === 'boolean' ) return setProperty;
	if ( typeof template === 'string' ) return setAttribute;

	// TODO all the other finicky types

	return setAttribute;
}

function updateId () {
	var { node, value } = this;

	this.ractive.nodes[ value ] = node;
	node.id = value;
}

function setProperty () {
	this.element.node[ this.name ] = this.value;
}

function setAttribute () {
	this.element.node.setAttribute( this.name, safeToStringValue( this.value ) );
}
