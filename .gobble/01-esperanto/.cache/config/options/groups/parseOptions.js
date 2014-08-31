define(['config/options/groups/optionGroup'],function (optionGroup) {

	'use strict';
	
	var keys, parseOptions;
	
	keys = [
	 	'preserveWhitespace',
		'sanitize',
		'stripComments',
		'delimiters',
		'tripleDelimiters',
		'interpolate'
	];
	
	parseOptions = optionGroup( keys, key => key );
	
	return parseOptions;

});