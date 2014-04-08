define([
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getStringLiteral/makeQuotedStringMatcher'
], function (
	makeQuotedStringMatcher
) {

	'use strict';

	return makeQuotedStringMatcher( "'" );

});
