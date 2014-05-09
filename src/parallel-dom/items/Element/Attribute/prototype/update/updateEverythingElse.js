export default function Attribute$updateEverythingElse () {
	var node, value, binding;

	node = this.node;
	value = this.value;

	if ( this.namespace ) {
		node.setAttributeNS( this.namespace, this.name, value );
	}

	else {
		node.setAttribute( this.name, value );
	}
}
