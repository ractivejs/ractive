define([
	'config/types',
	'parse/Parser/expressions/getExpression'
], function (
	types,
	getExpression
) {

	'use strict';

	return function getKeypathExpression ( token ) {
		return {
			r: token.r,
			m: token.m.map( jsonify )
		};
	};

	function jsonify ( member ) {
		// Straightforward property, e.g. `foo.bar`?
		if ( member.n ) {
			return member.n;
		}

		// String or number literal, e.g. `foo["bar"]` or `foo[1]`?
		if ( member.x.t === types.STRING_LITERAL || member.x.t === types.NUMBER_LITERAL ) {
			return member.x.v;
		}

		// Straightforward reference, e.g. `foo[bar]`?
		if ( member.x.t === types.REFERENCE ) {
			return member.x;
		}

		// If none of the above, we need to process the AST
		return getExpression( member.x );
	}

});
