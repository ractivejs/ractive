define(function () {

	'use strict';
	
	return [
		{
			delimiters: 'delimiters',
			isTriple: false,
			isStatic: false
		},
		{
			delimiters: 'tripleDelimiters',
			isTriple: true,
			isStatic: false
		},
		{
			delimiters: 'staticDelimiters',
			isTriple: false,
			isStatic: true
		},
		{
			delimiters: 'staticTripleDelimiters',
			isTriple: true,
			isStatic: true
		}
	];

});