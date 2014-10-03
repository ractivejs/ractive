var implicitOption = { implicit: true }, noCascadeOption = { noCascade: true };

export default function Viewmodel$smartUpdate ( keypath, array, newIndices ) {
	var dependants, oldLength;

	oldLength = newIndices.length;

	// Indices that are being removed should be marked as dirty
	newIndices.forEach( ( newIndex, oldIndex ) => {
		if ( newIndex === -1 ) {
			this.mark( keypath + '.' + oldIndex, noCascadeOption );
		}
	});

	// Update the model
	// TODO allow existing array to be updated in place, rather than replaced?
	this.set( keypath, array, true );

	if ( dependants = this.deps[ 'default' ][ keypath ] ) {
		dependants.filter( canSmartUpdate ).forEach( dependant => dependant.merge( newIndices, array ) );
	}

	if ( oldLength !== array.length ) {
		this.mark( keypath + '.length', implicitOption );

		for ( let i = oldLength; i < array.length; i += 1 ) {
			this.mark( keypath + '.' + i );
		}

		// don't allow removed indexes beyond end of new array to trigger recomputations
		for ( let i = array.length; i < oldLength; i += 1 ) {
			this.mark( keypath + '.' + i, noCascadeOption );
		}
	}
}

function canSmartUpdate ( dependant ) {
	return typeof dependant.merge === 'function';
}