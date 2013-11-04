define([
	'parse/getToken/getMustacheOrTriple/_index',
	'parse/getToken/getComment/getComment',
	'parse/getToken/getTag/getTag',
	'parse/getToken/getText/getText'
], function (
	getMustacheOrTriple,
	getComment,
	getTag,
	getText
) {

	'use strict';

	return function ( tokenizer ) {
		var token = getMustacheOrTriple( tokenizer ) ||
		            getComment( tokenizer ) ||
		            getTag( tokenizer ) ||
		            getText( tokenizer );

		return token;
	};
});