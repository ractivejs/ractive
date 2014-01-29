define([ 'render/DomFragment/Attribute/_Attribute' ], function ( DomAttribute ) {

	'use strict';

	return function ( element, attributes ) {
		var attrName, attrValue, attr;

		element.attributes = [];

		for ( attrName in attributes ) {
			if ( attributes.hasOwnProperty( attrName ) ) {
				attrValue = attributes[ attrName ];

				attr = new DomAttribute({
					element:      element,
					name:         attrName,
					value:        attrValue,
					root:         element.root,
					pNode:        element.node,
					contextStack: element.parentFragment.contextStack
				});

				// store against both index and name, for fast iteration and lookup
				element.attributes.push( element.attributes[ attrName ] = attr );

				// The name attribute is a special case - it is the only two-way attribute that updates
				// the viewmodel based on the value of another attribute. For that reason it must wait
				// until the node has been initialised, and the viewmodel has had its first two-way
				// update, before updating itself (otherwise it may disable a checkbox or radio that
				// was enabled in the template)
				if ( attrName !== 'name' ) {
					attr.update();
				}
			}
		}

		return element.attributes;
	};

});
