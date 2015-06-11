import { safeToStringValue } from 'utils/dom';

export default function getUpdateDelegate ({ element, name, template }) {
	if ( typeof template === 'boolean' ) return setProperty;
	if ( typeof template === 'string' ) return setAttribute;

	// TODO all the other finicky types

	return setAttribute;
}

function setProperty () {
	this.element.node[ this.name ] = this.value;
}

function setAttribute () {
	this.element.node.setAttribute( this.name, safeToStringValue( this.value ) );
}
