define([
	'render/DomFragment/Element/initialise/createElementAttribute'
], function ( createElementAttribute ) {

	'use strict';

	return function ( element, attributes ) {
		var attrName;

		element.attributes = [];

		for ( attrName in attributes ) {
			if ( attributes.hasOwnProperty( attrName ) ) {
				createElementAttribute( element, attrName, attributes[ attrName ] );
			}
		}

		return element.attributes;
	};

});
