/*global console */
var svg, isClient, hasConsole;

if ( typeof document === 'undefined' ) {
	svg = false;
} else {
	svg = document && document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );
}

isClient = ( typeof document === 'object' );

hasConsole = ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' );

export { hasConsole, isClient, svg };