export default function Attribute$updateClassName () {
	var node, value;

	node = this.node;
	value = this.fragment.getValue();

	if ( value === undefined ) {
		value = '';
	}

	if ( value !== this.value ) {
		node.className = value;
		this.value = value;
	}

	return this;
}
