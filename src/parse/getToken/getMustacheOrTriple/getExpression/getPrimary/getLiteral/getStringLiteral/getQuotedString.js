define([
	'parse/getToken/utils/getRegexMatcher',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getStringLiteral/getEscapedChars'
], function (
	getRegexMatcher,
	getEscapedChars
) {

	'use strict';

	var getUnescapedDoubleQuotedChars = getRegexMatcher( /^[^\\"]+/ ),
		getUnescapedSingleQuotedChars = getRegexMatcher( /^[^\\']+/ );

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