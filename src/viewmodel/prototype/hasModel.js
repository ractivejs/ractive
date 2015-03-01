
export function hasModel ( keypath ) {
	// TODO it *may* be worth having two versions of this function - one where
	// modelCache inherits from null, and one for IE8. Depends on how
	// much of an overhead hasOwnProperty is - probably negligible
	return this.modelCache.hasOwnProperty( keypath );

}

export function tryGetModel ( keypath ) {
	return this.hasModel( keypath ) ? this.getModel( keypath ) : null;
}
