import { safeToStringValue } from 'utils/dom';

export default function getUpdateDelegate ({ element, name, template }) {
	if ( name === 'id' ) return updateId;

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

function setProperty () {
	this.node[ this.name ] = this.getValue();
}

function setAttribute () {
	this.node.setAttribute( this.name, safeToStringValue( this.getString() ) );
}
