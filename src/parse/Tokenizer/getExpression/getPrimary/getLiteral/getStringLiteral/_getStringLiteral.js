define([
	'config/types',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getStringLiteral/getSingleQuotedString',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getStringLiteral/getDoubleQuotedString',
], function (
	types,
	getSingleQuotedString,
	getDoubleQuotedString
) {

	'use strict';

	return function ( tokenizer ) {
		var start, string;

		start = tokenizer.pos;

		if ( tokenizer.getStringMatch( '"' ) ) {
			string = getDoubleQuotedString( tokenizer );

			if ( !tokenizer.getStringMatch( '"' ) ) {
				tokenizer.pos = start;
				return null;
			}

			return {
				t: types.STRING_LITERAL,
				v: string
			};
		}

		if ( tokenizer.getStringMatch( "'" ) ) {
			string = getSingleQuotedString( tokenizer );

			if ( !tokenizer.getStringMatch( "'" ) ) {
				tokenizer.pos = start;
				return null;
			}

			return {
				t: types.STRING_LITERAL,
				v: string
			};
		}

		return null;
	};

});
