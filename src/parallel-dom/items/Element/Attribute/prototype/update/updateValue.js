export default function Attribute$updateValue () {
	var node, value;

	node = this.node;
	value = this.value;

	// with two-way binding, only update if the change wasn't initiated by the user
	// otherwise the cursor will often be sent to the wrong place
	if ( !this.locked ) {
		node.value = ( value == undefined ? '' : value );
	}
}
