export default function Attribute$updateIdAttribute () {
	var node, value;

	node = this.node;
	value = this.value;

	if ( value !== undefined ) {
		this.root.nodes[ value ] = undefined;
	}

	this.root.nodes[ value ] = node;

	node.setAttribute( 'id', value ); // TODO node.id = value? does that work for SVG?
}
