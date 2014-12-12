import { arrayContains } from 'utils/array';
import { isArray } from 'utils/is';

export default function Attribute$updateMultipleSelect () {
	var value = this.value, options, i, option, optionValue;

	if ( !isArray( value ) ) {
		value = [ value ];
	}

	options = this.node.options;
	i = options.length;

	while ( i-- ) {
		option = options[i];
		optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive
		option.selected = arrayContains( value, optionValue );
	}
}
