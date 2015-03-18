import Attribute from '../../Attribute/_Attribute';

export default function ( element, attributes ) {
	var name, attribute, result = [];

	for ( name in attributes ) {
		// skip binding attributes
		if ( name === 'twoway' || name === 'lazy') {
			continue;
		}

		if ( attributes.hasOwnProperty( name ) ) {
			attribute = new Attribute({
				element: element,
				name:    name,
				value:   attributes[ name ],
				root:    element.root
			});

			result[ name ] = attribute;

			if ( name !== 'value' ) {
				result.push( attribute );
			}
		}
	}

	// value attribute goes last. This is because it
	// may get clamped on render otherwise, e.g. in
	// `<input type='range' value='999' min='0' max='1000'>`
	// since default max is 100
	if ( attribute = result.value ) {
		result.push( attribute );
	}

	return result;
}
