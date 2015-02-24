var implicitOption = { implicit: true }, noCascadeOption = { noCascade: true };

export default function Viewmodel$smartUpdate ( keypath, array, newIndices ) {
	var dependants, oldLength, i, allCanShuffle = true, d;

	oldLength = newIndices.length;

	// Indices that are being removed should be marked as dirty
	newIndices.forEach( ( newIndex, oldIndex ) => {
		if ( newIndex === -1 ) {
			this.mark( keypath.join( oldIndex ), noCascadeOption );
		}
	});

	// Update the model
	// TODO allow existing array to be updated in place, rather than replaced?
	this.set( keypath, array, { silent: true } );

	if ( dependants = this.deps[ 'default' ][ keypath.str ] ) {
		i = dependants.length;
		while ( d = dependants[ --i ] ) {
			if ( !canShuffle( d ) ) {
				allCanShuffle = false;
			} else {
				d.shuffle( newIndices, array );
			}
		}
	} else { // no direct deps, so make sure child deps get marked
		allCanShuffle = false;
	}

	if ( allCanShuffle && oldLength !== array.length ) {
		this.mark( keypath.join( 'length' ), implicitOption );

		for ( i = oldLength; i < array.length; i += 1 ) {
			this.mark( keypath.join( i ) );
		}

		// don't allow removed indexes beyond end of new array to trigger recomputations
		// TODO is this still necessary, now that computations are lazy?
		for ( i = array.length; i < oldLength; i += 1 ) {
			this.mark( keypath.join( i ), noCascadeOption );
		}
	}

	// after shuffle-able deps are shuffled, notify everything else
	if ( !allCanShuffle ) {
		this.mark( keypath );
	}
}

function canShuffle ( dependant ) {
	return typeof dependant.shuffle === 'function';
}
