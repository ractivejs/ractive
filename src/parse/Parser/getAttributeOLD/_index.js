define([
	'parse/Parser/getAttribute/AttributeStub/_index'
], function (
	AttributeStub
) {
	
	'use strict';

	return function ( tokens ) {
		return new AttributeStub( tokens );
	};

});