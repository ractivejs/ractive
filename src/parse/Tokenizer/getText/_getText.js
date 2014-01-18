define([
	'config/types',
	'parse/Tokenizer/utils/getLowestIndex'
], function (
	types,
	getLowestIndex
) {

	'use strict';

	return function () {
		var index, remaining, barrier;

		remaining = this.remaining();

		barrier = this.inside ? '</' + this.inside : '<';

		if ( this.inside && !this.interpolate[ this.inside ] ) {
			index = remaining.indexOf( barrier );
		} else {
			index = getLowestIndex( remaining, [ barrier, this.delimiters[0], this.tripleDelimiters[0] ] );
		}

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