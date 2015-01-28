import ConditionalAttribute from '../../ConditionalAttribute/_ConditionalAttribute';

export default function ( element, attributes ) {
	if ( !attributes ) {
		return [];
	}

	return [ new ConditionalAttribute( element, attributes ) ];
}
