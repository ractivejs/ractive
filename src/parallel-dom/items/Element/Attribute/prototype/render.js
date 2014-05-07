export default function Attribute$render ( node ) {
	this.node = node;
	this.update();
	node.setAttribute( this.name, this.value );
}
