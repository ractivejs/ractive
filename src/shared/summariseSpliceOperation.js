// This function summarises a splice operation, as returned from
// getSpliceEquivalent()

export default function ( len, start ) {
	var newIndices = [], i;

	for ( i = 0; i < len; i += 1 ) {
		if ( i < start ) {
			newIndices.push( i );
		}

		else {
			newIndices.push( -1 );
		}
	}

	return newIndices;
}
