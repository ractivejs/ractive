export default function Attribute$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	if ( this.fragment ) {
		this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );

		if ( this.twoway ) {
			// if the fragment this attribute belongs to gets rebound (as a result of
			// as section being updated via an array shift, unshift or splice), this
			// attribute needs to recognise that its keypath has changed
			this.keypath = this.interpolator.keypath || this.interpolator.ref;
		}
	}
}
