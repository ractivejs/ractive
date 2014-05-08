export default function Attribute$updateIdAttribute () {
	var node, value, binding;

	node = this.node;
	value = this.fragment.getValue();

	if ( this.value !== undefined ) {
		this.root.nodes[ this.value ] = undefined;
	}

	this.root.nodes[ value ] = node;

	node.setAttribute( this.name, value );
	this.value = value;
}
