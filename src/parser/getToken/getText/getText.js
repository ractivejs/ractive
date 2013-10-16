var getText = function ( tokenizer ) {
	var index, remaining;

	remaining = tokenizer.remaining();

	index = getLowestIndex( remaining, [ '<', tokenizer.delimiters[0], tokenizer.tripleDelimiters[0] ] );

	if ( !index ) {
		return null;
	}

	if ( index === -1 ) {
		index = remaining.length;
	}

	tokenizer.pos += index;
	return {
		type: TEXT,
		value: remaining.substr( 0, index )
	};
};