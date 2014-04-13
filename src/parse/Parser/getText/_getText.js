define([
	'config/types',
	'parse/Parser/getText/TextStub/_TextStub',
	'parse/Parser/getText/TextStub/decodeCharacterReferences'
], function (
	types,
	TextStub,
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

			//return new TextStub( token, preserveWhitespace );
		}

		return null;
	};

});
