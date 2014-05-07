export default function ( haystack, needles ) {
	var i, index, lowest;

	i = needles.length;
	while ( i-- ) {
		index = haystack.indexOf( needles[i] );

		// short circuit
		if ( !index ) {
			return 0;
		}

		if ( index === -1 ) {
			continue;
		}

		if ( !lowest || ( index < lowest ) ) {
			lowest = index;
		}
	}

	return lowest || -1;
}
