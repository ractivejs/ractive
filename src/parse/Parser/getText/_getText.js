define([
	'config/types',
	'parse/Parser/getText/decodeCharacterReferences'
], function (
	types,
	decodeCharacterReferences
) {

	'use strict';

	var whitespace = /\s+/g;

	return function ( token, preserveWhitespace ) {
		var text;

		if ( token.type === types.TEXT ) {
			this.pos += 1;

			text = ( preserveWhitespace ? token.value : token.value.replace( whitespace, ' ' ) );
			return decodeCharacterReferences( text );
		}

		return null;
	};

});
