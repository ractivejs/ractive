define([
	'config/types',
	'parse/Parser/getText/TextStub/decodeCharacterReferences'
], function (
	types,
	decodeCharacterReferences
) {

	'use strict';

	var TextStub, whitespace;

	whitespace = /\s+/g;

	TextStub = function ( token, preserveWhitespace ) {
		this.text = ( preserveWhitespace ? token.value : token.value.replace( whitespace, ' ' ) );
	};

	TextStub.prototype = {
		type: types.TEXT,

		toJSON: function () {
			// this will be used within HTML, so we need to decode things like &amp;
			return this.decoded || ( this.decoded = decodeCharacterReferences( this.text) );
		},

		toString: function () {
			// this will be used as straight text
			return this.text;
		}
	};

	return TextStub;

});
