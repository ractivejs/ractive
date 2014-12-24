import { isArray } from 'utils/is';

export default function Attribute$updateCheckboxName () {
	var { element, node, value } = this, valueAttribute, i;

	valueAttribute = element.getAttribute( 'value' );

	if ( !isArray( value ) ) {
		node.checked = ( value == valueAttribute );
	} else {
		i = value.length;
		while ( i-- ) {
			if ( valueAttribute == value[i] ) {
				node.checked = true;
				return;
			}
		}
		node.checked = false;
	}
}
