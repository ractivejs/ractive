var svg, isClient;

if ( typeof document === 'undefined' ) {
	svg = false;
} else {
	svg = document && document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );
}

isClient = ( typeof document === 'object' );

export { svg, isClient };