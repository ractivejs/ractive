import createElementAttribute from 'render/DomFragment/Element/initialise/createElementAttribute';

export default function ( element, attributes ) {
    var attrName;

    element.attributes = [];

    for ( attrName in attributes ) {
        if ( attributes.hasOwnProperty( attrName ) ) {
            createElementAttribute( element, attrName, attributes[ attrName ] );
        }
    }

    return element.attributes;
};
