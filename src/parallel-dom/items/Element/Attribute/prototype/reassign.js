export default function Attribute$reassign ( indexRef, newIndex, oldKeypath, newKeypath ) {
	if ( this.fragment ) {
		this.fragment.reassign( indexRef, newIndex, oldKeypath, newKeypath );

		if ( this.twoway ) {
			this.updateBindings();
		}
	}
}
