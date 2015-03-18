export default function Attribute$rebind ( oldKeypath, newKeypath ) {
	if ( this.fragment ) {
		this.fragment.rebind( oldKeypath, newKeypath );
	}
}
