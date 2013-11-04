define([
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getObjectLiteral/getKeyValuePair'
], function (
	getStringMatch,
	getKeyValuePair
) {
	
	'use strict';

	return function getKeyValuePairs ( tokenizer ) {
		var start, pairs, pair, keyValuePairs;

		start = tokenizer.pos;

		pair = getKeyValuePair( tokenizer );
		if ( pair === null ) {
			return null;
		}

		pairs = [ pair ];

		if ( getStringMatch( tokenizer, ',' ) ) {
			keyValuePairs = getKeyValuePairs( tokenizer );

			if ( !keyValuePairs ) {
				tokenizer.pos = start;
				return null;
			}

			return pairs.concat( keyValuePairs );
		}

		return pairs;
	};

});