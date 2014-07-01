export default function Attribute$rebind ( indexRef, newIndex, oldKeypath, newKeypath ) {
	if ( this.fragment ) {
		this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	}
}
