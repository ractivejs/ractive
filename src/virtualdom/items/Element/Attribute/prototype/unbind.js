export default function Attribute$unbind () {
	// ignore non-dynamic attributes
	if ( this.fragment ) {
		this.fragment.unbind();
	}

	if ( this.name === 'id' ) {
		delete this.root.nodes[ this.value ];
	}
}
