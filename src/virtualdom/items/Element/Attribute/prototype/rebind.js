export default function Attribute$rebind ( oldKeypath, newKeypath, newValue = true ) {
	if ( this.fragment ) {
		this.fragment.rebind( oldKeypath, newKeypath, newValue );
	}
}
