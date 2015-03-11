var implicitOption = { implicit: true }, noCascadeOption = { noCascade: true };

export default function Viewmodel$smartUpdate ( keypath, array, newIndices ) {
	var dependants, oldLength, i;

	this.set( keypath, array, { silent: true } );

	oldLength = newIndices.length;

	// Indices that are being removed should be marked as dirty
	newIndices.forEach( ( newIndex, oldIndex ) => {
		if ( newIndex === -1 ) {
			this.mark( keypath.join( oldIndex ), noCascadeOption );
		}
	});

	if ( dependants = this.deps[ 'default' ][ keypath.str ] ) {
		dependants.filter( canShuffle ).forEach( d => d.shuffle( newIndices, array ) );
	}

	if ( oldLength !== array.length ) {
		this.mark( keypath.join( 'length' ), implicitOption );

		for ( i = newIndices.touchedFrom; i < array.length; i += 1 ) {
			this.mark( keypath.join( i ) );
		}

		// don't allow removed indexes beyond end of new array to trigger recomputations
		// TODO is this still necessary, now that computations are lazy?
		for ( i = array.length; i < oldLength; i += 1 ) {
			this.mark( keypath.join( i ), noCascadeOption );
		}
	}
}

function canShuffle ( dependant ) {
	return typeof dependant.shuffle === 'function';
}
