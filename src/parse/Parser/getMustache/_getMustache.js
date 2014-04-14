define([
	'config/types',
	'parse/Parser/getMustache/MustacheStub'
], function (
	types,
	MustacheStub
) {

	'use strict';

	return function ( token ) {
		if ( token.type === types.MUSTACHE || token.type === types.TRIPLE ) {
			if ( token.mustacheType === types.SECTION || token.mustacheType === types.INVERTED ) {
				return null;
			}

			return new MustacheStub( token, this );
		}
	};

});
