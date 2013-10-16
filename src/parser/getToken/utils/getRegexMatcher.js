var getRegexMatcher = function ( regex ) {
	return function ( tokenizer ) {
		var match = regex.exec( tokenizer.str.substring( tokenizer.pos ) );

		if ( !match ) {
			return null;
		}

		tokenizer.pos += match[0].length;
		return match[1] || match[0];
	};
};