var getText = function ( tokenizer ) {
	var minIndex, text;

	minIndex = tokenizer.str.length;

	// anything goes except opening delimiters or a '<'
	[ tokenizer.delimiters[0], tokenizer.tripleDelimiters[0], '<' ].forEach( function ( substr ) {
		var index = tokenizer.str.indexOf( substr, tokenizer.pos );

		if ( index !== -1 ) {
			minIndex = Math.min( index, minIndex );
		}
	});

	if ( minIndex === tokenizer.pos ) {
		return null;
	}

	text = tokenizer.str.substring( tokenizer.pos, minIndex );
	tokenizer.pos = minIndex;

	return {
		type: TEXT,
		value: text
	};

};