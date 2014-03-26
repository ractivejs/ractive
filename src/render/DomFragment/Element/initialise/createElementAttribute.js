define([
	'render/DomFragment/Attribute/_Attribute'
], function (
	Attribute
) {

	'use strict';

	return function createElementAttribute ( element, name, fragment ) {
		var attr = new Attribute({
			element:      element,
			name:         name,
			value:        fragment,
			root:         element.root,
			pNode:        element.node
		});

		// store against both index and name, for fast iteration and lookup
		element.attributes.push( element.attributes[ name ] = attr );

		// The name attribute is a special case - it is the only two-way attribute that updates
		// the viewmodel based on the value of another attribute. For that reason it must wait
		// until the node has been initialised, and the viewmodel has had its first two-way
		// update, before updating itself (otherwise it may disable a checkbox or radio that
		// was enabled in the template)
		if ( name !== 'name' ) {
			attr.update();
		}
	};

});
