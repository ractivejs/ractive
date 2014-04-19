define([
	'circular'
], function (
	circular
) {

	'use strict';

	var Parser, empty = {};

	circular.push( function () {
		Parser = circular.Parser;
	});

	return function getStringFragment ( tokens ) {
		var parser = new Parser( tokens, empty );
		return parser.result;
	};

});
