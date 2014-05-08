import Attribute from 'parallel-dom/items/Element/Attribute/_Attribute';

export default function ( element, attributes ) {
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
}

// TODO... account for this

/*// The name attribute is a special case - it is the only two-way attribute that updates
// the viewmodel based on the value of another attribute. For that reason it must wait
// until the node has been initialised, and the viewmodel has had its first two-way
// update, before updating itself (otherwise it may disable a checkbox or radio that
// was enabled in the template)
if ( name !== 'name' ) {
	attr.update();
}*/
