export default function Attribute$updateContentEditableValue () {
	var node, value;

	node = this.node;
	value = this.fragment.getValue();

	if ( value === undefined ) {
		value = '';
	}

	if ( value !== this.value ) {
		if ( !this.active ) {
			node.innerHTML = value;
		}

		this.value = value;
	}

	return this;
}
