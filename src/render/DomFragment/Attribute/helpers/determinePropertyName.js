import namespaces from 'config/namespaces';

// the property name equivalents for element attributes, where they differ
// from the lowercased attribute name
var propertyNames = {
    'accept-charset': 'acceptCharset',
    accesskey: 'accessKey',
    bgcolor: 'bgColor',
    'class': 'className',
    codebase: 'codeBase',
    colspan: 'colSpan',
    contenteditable: 'contentEditable',
    datetime: 'dateTime',
    dirname: 'dirName',
    'for': 'htmlFor',
    'http-equiv': 'httpEquiv',
    ismap: 'isMap',
    maxlength: 'maxLength',
    novalidate: 'noValidate',
    pubdate: 'pubDate',
    readonly: 'readOnly',
    rowspan: 'rowSpan',
    tabindex: 'tabIndex',
    usemap: 'useMap'
};

export default function ( attribute, options ) {
    var propertyName;

    if ( attribute.pNode && !attribute.namespace && ( !options.pNode.namespaceURI || options.pNode.namespaceURI === namespaces.html ) ) {
        propertyName = propertyNames[ attribute.name ] || attribute.name;

        if ( options.pNode[ propertyName ] !== undefined ) {
            attribute.propertyName = propertyName;
        }

        // is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
        // node.selected = true rather than node.setAttribute( 'selected', '' )
        if ( typeof options.pNode[ propertyName ] === 'boolean' || propertyName === 'value' ) {
            attribute.useProperty = true;
        }
    }
};
