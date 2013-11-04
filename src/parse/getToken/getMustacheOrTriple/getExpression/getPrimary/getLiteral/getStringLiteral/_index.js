define([
	'config/types',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getStringLiteral/getQuotedString'
], function (
	types,
	getStringMatch,
	getQuotedString
) {
	
	'use strict';

	return function ( tokenizer ) {
		var start, string;

		start = tokenizer.pos;

		if ( getStringMatch( tokenizer, '"' ) ) {
			string = getQuotedString( tokenizer, false );
		
			if ( !getStringMatch( tokenizer, '"' ) ) {
				tokenizer.pos = start;
				return null;
			}

			return {
				t: types.STRING_LITERAL,
				v: string
			};
		}

		if ( getStringMatch( tokenizer, "'" ) ) {
			string = getQuotedString( tokenizer, true );

			if ( !getStringMatch( tokenizer, "'" ) ) {
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