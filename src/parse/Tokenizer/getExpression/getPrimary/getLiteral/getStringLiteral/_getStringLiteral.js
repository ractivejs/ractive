define([
	'config/types',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getStringLiteral/getQuotedString'
], function (
	types,
	getQuotedString
) {
	
	'use strict';

	return function ( tokenizer ) {
		var start, string;

		start = tokenizer.pos;

		if ( tokenizer.getStringMatch( '"' ) ) {
			string = getQuotedString( tokenizer, false );
		
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
			string = getQuotedString( tokenizer, true );

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