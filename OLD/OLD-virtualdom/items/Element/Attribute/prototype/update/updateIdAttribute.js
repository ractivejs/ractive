export default function Attribute$updateIdAttribute () {
	var { node, value } = this;

	this.root.nodes[ value ] = node;
	node.id = value;
}
