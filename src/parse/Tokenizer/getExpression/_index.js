define([
	'parse/Tokenizer/getExpression/getConditional'
], function (
	getConditional
) {

	'use strict';

	// The conditional operator is the lowest precedence operator (except yield,
	// assignment operators, and commas, none of which are supported), so we
	// start there. If it doesn't match, it 'falls through' to progressively
	// higher precedence operators, until it eventually matches (or fails to
	// match) a 'primary' - a literal or a reference. This way, the abstract syntax
	// tree has everything in its proper place, i.e. 2 + 3 * 4 === 14, not 20.
	return function () {
		return getConditional( this );
	};
	
});