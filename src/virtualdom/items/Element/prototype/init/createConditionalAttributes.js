import ConditionalAttribute from 'virtualdom/items/Element/ConditionalAttribute/_ConditionalAttribute';

export default function ( element, attributes ) {
	if ( !attributes ) {
		return [];
	}

	return attributes.map( a => {
		return new ConditionalAttribute( element, a );
	});
}
