// This function summarises a splice operation, as returned from
// getSpliceEquivalent()

export default function ( len, spliceEquivalent ) {
	var newIndices = [], removeStart, removeEnd, balance, i;

	balance = ( spliceEquivalent.length - 2 ) - spliceEquivalent[1];

	removeStart = Math.min( len, spliceEquivalent[0] );
	removeEnd = removeStart + spliceEquivalent[1];

	for ( i = 0; i < removeStart; i += 1 ) {
		newIndices.push( i );
	}

	for ( ; i < removeEnd; i += 1 ) {
		newIndices.push( -1 );
	}

	for ( ; i < len; i += 1 ) {
		newIndices.push( i + balance );
	}

	return newIndices;
}
