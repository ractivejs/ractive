import types from 'config/types';

export default function createMappings ( parent, attributes ) {
	var mappings = {}, key, attribute;

	// TODO ultimately, we want to trace mappings all the way
	// up to the original source. For the purpose of getting
	// to the point where that's practical, we're just creating
	// single-level mappings for now

	for ( key in attributes ) {
		if ( attributes.hasOwnProperty( key ) ) {
			attribute = attributes[ key ];

			// TODO use a resolver (handle non-root refs, expressions, and reference expression resolvers)
			if ( attribute.length === 1 && attribute[0].t === types.INTERPOLATOR ) {
				mappings[ key ] = {
					source: parent,
					keypath: attribute[0].r
				};
			}
		}
	}

	return mappings;
}