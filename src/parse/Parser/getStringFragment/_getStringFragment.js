define([
	'parse/Parser/getStringFragment/StringParser'
], function (
	StringParser
) {

	'use strict';

	return function getStringFragment ( tokens ) {
		var parser = new StringParser( tokens );
		return parser.result;
	};

});
