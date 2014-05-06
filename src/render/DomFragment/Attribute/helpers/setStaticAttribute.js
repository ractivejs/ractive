import namespaces from 'config/namespaces';

export default function setStaticAttribute ( attribute, options ) {
    var node, value = options.value || '';

    if ( node = options.pNode ) {
        if ( attribute.namespace ) {
            node.setAttributeNS( attribute.namespace, options.name, value );
        } else {

            // is it a style attribute? and are we in a broken POS browser?
            if ( options.name === 'style' && node.style.setAttribute ) {
                node.style.setAttribute( 'cssText', value );
            }

            // some browsers prefer className to class...
            else if ( options.name === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
                node.className = value;
            }

            else {
                node.setAttribute( options.name, value );
            }
        }

        if ( attribute.name === 'id' ) {
            options.root.nodes[ options.value ] = node;
        }

        if ( attribute.name === 'value' ) {
            node._ractive.value = options.value;
        }
    }

    attribute.value = options.value || null;
};
