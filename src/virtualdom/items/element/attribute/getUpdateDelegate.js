import { safeToStringValue } from 'utils/dom';

export default function getUpdateDelegate ({ element, name, template }) {
	if ( name === 'id' ) {
		return updateId;
	}

	if ( name === 'value' ) {
		if ( element.getAttribute( 'contenteditable' ) != null ) return updateContentEditableValue;

	}

	if ( typeof template === 'boolean' ) return setProperty;
	if ( typeof template === 'string' ) return setAttribute;

	// TODO all the other finicky types

	return setAttribute;
}

function updateId () {
	const { node } = this;
	const value = this.getValue();

	this.ractive.nodes[ value ] = node;
	node.id = value;
}

function updateContentEditableValue () {
	const value = this.getValue();

	if ( !this.locked ) {
		this.node.innerHTML = value === undefined ? '' : value;
	}
}

function setProperty () {
	this.node[ this.name ] = this.getValue();
}

function setAttribute () {
	this.node.setAttribute( this.name, safeToStringValue( this.getString() ) );
}
