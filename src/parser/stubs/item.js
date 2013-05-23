stubs.item = function ( parser, priority, preserveWhitespace ) {
	if ( !parser.next() ) {
		return null;
	}

	return stubs.text( parser, preserveWhitespace )
	    || stubs.mustache( parser, priority, preserveWhitespace )
	    || stubs.element( parser, priority, preserveWhitespace );
};