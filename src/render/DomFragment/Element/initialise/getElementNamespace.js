import namespaces from 'config/namespaces';

export default function ( descriptor, parentNode ) {
    // if the element has an xmlns attribute, use that
    if ( descriptor.a && descriptor.a.xmlns ) {
        return descriptor.a.xmlns;
    }

    // otherwise, use the svg namespace if this is an svg element, or inherit namespace from parent
    return ( descriptor.e === 'svg' ? namespaces.svg : parentNode.namespaceURI || namespaces.html );
};
