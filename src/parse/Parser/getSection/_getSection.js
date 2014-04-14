define([
	'config/types',
	'parse/Parser/getSection/SectionStub'
], function (
	types,
	SectionStub
) {

	'use strict';

	return function ( token ) {
		if ( token.type === types.MUSTACHE && ( token.mustacheType === types.SECTION || token.mustacheType === types.INVERTED ) ) {
			return new SectionStub( token, this );
		}
	};

});
