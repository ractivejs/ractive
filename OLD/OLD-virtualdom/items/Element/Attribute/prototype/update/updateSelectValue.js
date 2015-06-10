export default function Attribute$updateSelect () {
	var value = this.value, options, option, optionValue, i;

	if ( !this.locked ) {
		this.node._ractive.value = value;

		options = this.node.options;
		i = options.length;

		while ( i-- ) {
			option = options[i];
			optionValue = option._ractive ? option._ractive.value : option.value; // options inserted via a triple don't have _ractive

			if ( optionValue == value ) { // double equals as we may be comparing numbers with strings
				option.selected = true;
				break;
			}
		}
	}

	// if we're still here, it means the new value didn't match any of the options...
	// TODO figure out what to do in this situation
}
