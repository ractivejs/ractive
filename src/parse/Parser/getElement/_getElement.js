define([
	'config/types',
	'parse/Parser/getElement/ElementStub/_ElementStub'
], function (
	types,
	ElementStub
) {

	'use strict';

	return function ( token ) {
		// sanitize
		if ( this.options.sanitize && this.options.sanitize.elements ) {
			if ( this.options.sanitize.elements.indexOf( token.name.toLowerCase() ) !== -1 ) {
				return null;
			}
		}

		return new ElementStub( token, this, this.preserveWhitespace );
	};

});