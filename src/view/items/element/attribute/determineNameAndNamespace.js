import * as namespaces from '../../../../config/namespaces';

export default function ( attribute, name ) {
	// are we dealing with a namespaced attribute, e.g. xlink:href?
	const colonIndex = name.indexOf( ':' );
	if ( colonIndex !== -1 ) {
		// looks like we are, yes...
		const namespacePrefix = name.substr( 0, colonIndex );

		// ...unless it's a namespace *declaration*, which we ignore (on the assumption
		// that only valid namespaces will be used)
		if ( namespacePrefix !== 'xmlns' ) {
			name = name.substring( colonIndex + 1 );

			attribute.name = name;
			attribute.namespace = namespaces[ namespacePrefix.toLowerCase() ];
			attribute.namespacePrefix = namespacePrefix;

			if ( !attribute.namespace ) {
				throw 'Unknown namespace ("' + namespacePrefix + '")';
			}

			return;
		}
	}

	attribute.name = name;
}
