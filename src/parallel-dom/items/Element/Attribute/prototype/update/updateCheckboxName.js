import isArray from 'utils/isArray';

export default function Attribute$updateCheckboxName () {
	var node, value;

	node = this.node;
	value = this.fragment.getValue();

	if ( !isArray( value ) ) {
		node.checked = ( value == node._ractive.value );
		return this;
	}

	node.checked = ( value.indexOf( node._ractive.value ) !== -1 );

	return this;
}
