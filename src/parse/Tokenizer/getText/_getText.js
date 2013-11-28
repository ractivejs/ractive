define([
	'config/types',
	'parse/Tokenizer/utils/getLowestIndex'
], function (
	types,
	getLowestIndex
) {

	'use strict';

	return function () {
		var index, remaining;

		remaining = this.remaining();

		index = getLowestIndex( remaining, [ ( this.insideScriptTag ? '</script' : '<' ), this.delimiters[0], this.tripleDelimiters[0] ] );

		if ( !index ) {
			return null;
		}

		if ( index === -1 ) {
			index = remaining.length;
		}

		this.pos += index;
		return {
			type: types.TEXT,
			value: remaining.substr( 0, index )
		};
	};

});