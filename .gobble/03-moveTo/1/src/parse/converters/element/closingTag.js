define(['config/types'],function (types) {

	'use strict';
	
	var closingTagPattern = /^([a-zA-Z]{1,}:?[a-zA-Z0-9\-]*)\s*\>/;
	
	return function ( parser ) {
		var tag;
	
		// are we looking at a closing tag?
		if ( !parser.matchString( '</' ) ) {
			return null;
		}
	
		if ( tag = parser.matchPattern( closingTagPattern ) ) {
			return {
				t: types.CLOSING_TAG,
				e: tag
			};
		}
	
		// We have an illegal closing tag, report it
		parser.pos -= 2;
		parser.error( 'Illegal closing tag' );
	};

});