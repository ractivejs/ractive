export default function lookupNamespace ( element, prefix ) {
	const qualified = `xmlns:${prefix}`;
	let namespace;

	while ( element ) {
		namespace = element.getAttribute( qualified );
		if ( namespace ) return namespace;

		element = element.parent;
	}

	return null;
}
