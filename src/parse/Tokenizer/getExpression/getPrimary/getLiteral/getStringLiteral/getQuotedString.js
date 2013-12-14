define([
	'parse/Tokenizer/utils/makeRegexMatcher',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getStringLiteral/getEscapedChars'
], function (
	makeRegexMatcher,
	getEscapedChars
) {

	'use strict';

	var getUnescapedDoubleQuotedChars = makeRegexMatcher( /^[^\\"]+/ ),
		getUnescapedSingleQuotedChars = makeRegexMatcher( /^[^\\']+/ );

	return function getQuotedString ( tokenizer, singleQuotes ) {
		var start, string, escaped, unescaped, next, matcher;

		start = tokenizer.pos;

		string = '';
		matcher = ( singleQuotes ? getUnescapedSingleQuotedChars : getUnescapedDoubleQuotedChars );

		escaped = getEscapedChars( tokenizer );
		if ( escaped ) {
			string += escaped;
		}

		unescaped = matcher( tokenizer );
		if ( unescaped ) {
			string += unescaped;
		}

		if ( !string ) {
			return '';
		}

		next = getQuotedString( tokenizer, singleQuotes );
		while ( next !== '' ) {
			string += next;
		}

		return string;
	};

});