define(['virtualdom/items/Element/Attribute/_Attribute'],function (Attribute) {

	'use strict';
	
	return function ( element, attributes ) {
		var name, attribute, result = [];
	
		for ( name in attributes ) {
			if ( attributes.hasOwnProperty( name ) ) {
				attribute = new Attribute({
					element: element,
					name:    name,
					value:   attributes[ name ],
					root:    element.root
				});
	
				result.push( result[ name ] = attribute );
			}
		}
	
		return result;
	};

});