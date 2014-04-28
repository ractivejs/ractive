define([
	'config/types',
	'parse/converters/utils/getLowestIndex',
	'parse/converters/utils/decodeCharacterReferences'
], function (
	types,
	getLowestIndex,
	decodeCharacterReferences
) {

	'use strict';

	return function ( parser ) {
		var index, remaining, barrier;

		remaining = parser.remaining();

		barrier = parser.inside ? '</' + parser.inside : '<';

		if ( parser.inside && !parser.interpolate[ parser.inside ] ) {
			index = remaining.indexOf( barrier );
		} else {
			index = getLowestIndex( remaining, [ barrier, parser.delimiters[0], parser.tripleDelimiters[0] ] );
		}

		if ( !index ) {
			return null;
		}

		if ( index === -1 ) {
			index = remaining.length;
		}

		parser.pos += index;

		return decodeCharacterReferences( remaining.substr( 0, index ) );
	};

});
