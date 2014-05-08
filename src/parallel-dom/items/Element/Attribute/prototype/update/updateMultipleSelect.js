export default function Attribute$updateMultipleSelect () {
	var value = this.fragment.getValue(), options, i, option, optionValue;

	if ( !isArray( value ) ) {
		value = [ value ];
	}

	options = this.node.options;
	i = options.length;

	while ( i-- ) {
		option = options[i];
		optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive
		option.selected = ( value.indexOf( optionValue ) !== -1 );
	}

	this.value = value;

	return this;
}
