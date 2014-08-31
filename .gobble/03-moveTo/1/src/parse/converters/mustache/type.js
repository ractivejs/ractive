define(['config/types'],function (types) {

	'use strict';
	
	var mustacheTypes = {
		'#': types.SECTION,
		'^': types.INVERTED,
		'/': types.CLOSING,
		'>': types.PARTIAL,
		'!': types.COMMENT,
		'&': types.TRIPLE
	};
	
	return function ( parser ) {
		var type = mustacheTypes[ parser.str.charAt( parser.pos ) ];
	
		if ( !type ) {
			return null;
		}
	
		parser.pos += 1;
		return type;
	};

});