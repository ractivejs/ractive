define([ 'config/types' ], function ( types ) {

	'use strict';

	var mustacheTypes = {
		'#': types.SECTION,
		'^': types.INVERTED,
		'/': types.CLOSING,
		'>': types.PARTIAL,
		'!': types.COMMENT,
		'&': types.TRIPLE
	};

	var handlebarsTypes = {
		'if': types.SECTION_IF,
		'unless': types.SECTION_UNLESS,
		'with': types.SECTION_WITH,
		'each': types.SECTION_EACH,
		'try': types.SECTION_TRY
	};

	return function ( parser ) {
		var type = mustacheTypes[ parser.str.charAt( parser.pos ) ];

		if ( !type ) {
			return null;
		}

		parser.pos += 1;

		if (parser.handlebars && type === types.SECTION) {
			var handlebarsType = parser.matchPattern( /(if|unless|with|each|try)\b/ );

			if (handlebarsType && handlebarsTypes[handlebarsType]) {
				parser.allowWhitespace();

				return handlebarsTypes[handlebarsType];
			}
		}

		return type;
	};

});
