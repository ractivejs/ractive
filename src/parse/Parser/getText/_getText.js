define([
	'config/types',
	'parse/Parser/getText/TextStub/_TextStub'
], function (
	types,
	TextStub
) {
	
	'use strict';

	return function ( token ) {
		if ( token.type === types.TEXT ) {
			this.pos += 1;
			return new TextStub( token, this.preserveWhitespace );
		}

		return null;
	};

});