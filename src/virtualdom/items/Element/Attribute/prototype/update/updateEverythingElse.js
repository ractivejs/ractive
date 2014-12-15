export default function Attribute$updateEverythingElse () {
	var { node, namespace, name, value, fragment } = this;

	if ( namespace ) {
		node.setAttributeNS( namespace, name, ( fragment || value ).toString() );
	}

	else if ( !this.isBoolean ) {
		node.setAttribute( name, ( fragment || value ).toString() );
	}

	// Boolean attributes - truthy becomes '', falsy means 'remove attribute'
	else {
		if ( value ) {
			node.setAttribute( name, '' );
		} else {
			node.removeAttribute( name );
		}
	}
}
