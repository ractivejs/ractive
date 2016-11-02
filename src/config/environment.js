/*global console, navigator, global */

const win = typeof window !== 'undefined' ? window : null;
const doc = win ? document : null;
const top = typeof global !== 'undefined' ? global : window;

const isClient = !!doc;
const isJsdom = ( typeof navigator !== 'undefined' && /jsDom/.test( navigator.appName ) );
const hasConsole = ( typeof console !== 'undefined' && typeof console.warn === 'function' && typeof console.warn.apply === 'function' );

let magic;
try {
	Object.defineProperty({}, 'test', { value: 0 });
	magic = true;
} catch ( e ) {
	magic = false;
}

const svg = doc ?
	doc.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1' ) :
	false;

const vendors = [ 'o', 'ms', 'moz', 'webkit' ];

export { win, doc, top, isClient, isJsdom, hasConsole, magic, svg, vendors };
