/*global console, navigator */

export const isClient = ( typeof document === 'object' );

export const isJsdom = ( typeof navigator !== 'undefined' && /jsDom/.test( navigator.appName ) );

export const hasConsole = ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' );

export let magic;
try {
	Object.defineProperty({}, 'test', { value: 0 });
	magic = true;
} catch ( e ) {
	magic = false;
}

export let svg;
if ( typeof document === 'undefined' ) {
	svg = false;
} else {
	svg = document && document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' );
}

export const vendors = [ 'o', 'ms', 'moz', 'webkit' ];
