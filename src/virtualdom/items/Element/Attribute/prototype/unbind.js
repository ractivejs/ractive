export default function Attribute$unbind () {
	// ignore non-dynamic attributes
	if ( this.fragment ) {
		this.fragment.unbind();
	}
}
