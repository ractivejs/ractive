/*global console */
var isClient, hasConsole, magic, namespaces, svg, vendors;

isClient = ( typeof document === 'object' );

hasConsole = ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' );

try {
	Object.defineProperty({}, 'test', { value: 0 });
	magic = true;
} catch ( e ) {
	magic = false;
}

namespaces = {
	html:   'http://www.w3.org/1999/xhtml',
	mathml: 'http://www.w3.org/1998/Math/MathML',
	svg:    'http://www.w3.org/2000/svg',
	xlink:  'http://www.w3.org/1999/xlink',
	xml:    'http://www.w3.org/XML/1998/namespace',
	xmlns:  'http://www.w3.org/2000/xmlns/'
};

if ( typeof document === 'undefined' ) {
	svg = false;
} else {
	svg = document && document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );
}

vendors = [ 'o', 'ms', 'moz', 'webkit' ];

export { hasConsole, isClient, magic, namespaces, svg, vendors };