import namespaces from 'config/namespaces';
import enforceCase from 'render/DomFragment/shared/enforceCase';

export default function ( attribute, name ) {
    var colonIndex, namespacePrefix;

    // are we dealing with a namespaced attribute, e.g. xlink:href?
    colonIndex = name.indexOf( ':' );
    if ( colonIndex !== -1 ) {

        // looks like we are, yes...
        namespacePrefix = name.substr( 0, colonIndex );

        // ...unless it's a namespace *declaration*, which we ignore (on the assumption
        // that only valid namespaces will be used)
        if ( namespacePrefix !== 'xmlns' ) {
            name = name.substring( colonIndex + 1 );

            attribute.name = enforceCase( name );
            attribute.lcName = attribute.name.toLowerCase();
            attribute.namespace = namespaces[ namespacePrefix.toLowerCase() ];

            if ( !attribute.namespace ) {
                throw 'Unknown namespace ("' + namespacePrefix + '")';
            }

            return;
        }
    }

    // SVG attribute names are case sensitive
    attribute.name = ( attribute.element.namespace !== namespaces.html ? enforceCase( name ) : name );
    attribute.lcName = attribute.name.toLowerCase();
};
