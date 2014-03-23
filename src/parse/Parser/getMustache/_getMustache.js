define([
	'config/types',
	'parse/Parser/getMustache/MustacheStub',
	'parse/Parser/getMustache/SectionStub'
], function (
	types,
	MustacheStub,
	SectionStub
) {

	'use strict';

	return function ( token ) {
		if ( token.type === types.MUSTACHE || token.type === types.TRIPLE ) {
			if ( token.mustacheType === types.SECTION || token.mustacheType === types.INVERTED ) {
				return new SectionStub( token, this );
			}

			return new MustacheStub( token, this );
		}
	};

});
