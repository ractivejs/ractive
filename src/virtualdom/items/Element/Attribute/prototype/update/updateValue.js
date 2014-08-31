export default function Attribute$updateValue () {
	var { node, value } = this;

	// store actual value, so it doesn't get coerced to a string
	node._ractive.value = value;

	// with two-way binding, only update if the change wasn't initiated by the user
	// otherwise the cursor will often be sent to the wrong place
	if ( !this.locked ) {
		node.value = ( value == undefined ? '' : value );
	}
}
