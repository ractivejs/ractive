import Attribute from '../../Attribute/_Attribute';

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
