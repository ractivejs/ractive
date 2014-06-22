export default function Element$unbind () {
	if ( this.fragment ) {
		this.fragment.unbind();
	}

	this.attributes.forEach( unbindAttribute );
}

function unbindAttribute ( attribute ) {
	attribute.unbind();
}
