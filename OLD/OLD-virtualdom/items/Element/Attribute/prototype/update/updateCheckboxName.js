import { isArray } from 'utils/is';

export default function Attribute$updateCheckboxName () {
	var { element, node, value } = this, { binding } = element, valueAttribute, i;

	valueAttribute = element.getAttribute( 'value' );

	if ( !isArray( value ) ) {
		binding.isChecked = node.checked = ( value == valueAttribute );
	} else {
		i = value.length;
		while ( i-- ) {
			if ( valueAttribute == value[i] ) {
				binding.isChecked = node.checked = true;
				return;
			}
		}
		binding.isChecked = node.checked = false;
	}
}
