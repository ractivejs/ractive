export default function Attribute$updateBooleanAttribute () {
	// with two-way binding, only update if the change wasn't initiated by the user
	// otherwise the cursor will often be sent to the wrong place
	if ( !this.locked ) {
		this.node[ this.propertyName ] = this.value;
	}
}
