export default function Viewmodel$getKeypath ( str ) {
	// TODO it *may* be worth having two versions of this function - one where
	// modelCache inherits from null, and one for IE8. Depends on how
	// much of an overhead hasOwnProperty is - probably negligible
	return this.modelCache.hasOwnProperty( str );
}
