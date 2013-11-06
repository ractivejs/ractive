define([ 'config/types' ], function ( types ) {
	
	'use strict';

	var mustacheTypes = {
		'#': types.SECTION,
		'^': types.INVERTED,
		'/': types.CLOSING,
		'>': types.PARTIAL,
		'!': types.COMMENT,
		'&': types.INTERPOLATOR
	};

	return function ( tokenizer ) {
		var type = mustacheTypes[ tokenizer.str.charAt( tokenizer.pos ) ];

		if ( !type ) {
			return null;
		}

		tokenizer.pos += 1;
		return type;
	};

});