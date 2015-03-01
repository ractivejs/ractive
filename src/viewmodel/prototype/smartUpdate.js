var implicitOption = { implicit: true }, noCascadeOption = { noCascade: true };

export default function Viewmodel$smartUpdate ( model, array, newIndices ) {
	var dependants, oldLength, i;

	oldLength = newIndices.length;

	// Indices that are being removed should be marked as dirty
	newIndices.forEach( ( newIndex, oldIndex ) => {
		if ( newIndex === -1 ) {
			model.join( oldIndex ).mark( noCascadeOption );
		}
	});

	// Update the model
	// TODO allow existing array to be updated in place, rather than replaced?
	this.set( model, array, { silent: true } );

	if ( dependants = this.deps[ 'default' ][ model.getKeypath() ] ) {
		dependants.filter( canShuffle ).forEach( d => d.shuffle( newIndices, array ) );
	}

	if ( oldLength !== array.length ) {
		model.join( 'length' ).mark( implicitOption );

		for ( i = oldLength; i < array.length; i += 1 ) {
			model.join( i ).mark();
		}

		// don't allow removed indexes beyond end of new array to trigger recomputations
		// TODO is this still necessary, now that computations are lazy?
		for ( i = array.length; i < oldLength; i += 1 ) {
			model.join( i ).mark( noCascadeOption );
		}
	}
}

function canShuffle ( dependant ) {
	return typeof dependant.shuffle === 'function';
}
