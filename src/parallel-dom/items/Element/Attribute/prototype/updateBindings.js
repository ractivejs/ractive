export default function Attribute$updateBindings () {
	// if the fragment this attribute belongs to gets reassigned (as a result of
	// as section being updated via an array shift, unshift or splice), this
	// attribute needs to recognise that its keypath has changed
	this.keypath = this.interpolator.keypath || this.interpolator.ref;

	// if we encounter the special case described above, update the name attribute
	if ( this.propertyName === 'name' ) {
		// replace actual name attribute
		this.pNode.name = '{{' + this.keypath + '}}';
	}
}
