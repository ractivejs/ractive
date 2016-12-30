import { doc } from '../config/environment';

const PREFIX = '/* Ractive.js component styles */';

// Holds current definitions of styles.
const styleDefinitions = [];

// Flag to tell if we need to update the CSS
let isDirty = false;

// These only make sense on the browser. See additional setup below.
let styleElement = null;
let useCssText = null;

export function addCSS( styleDefinition ) {
	styleDefinitions.push( styleDefinition );
	isDirty = true;
}

export function applyCSS() {

	// Apply only seems to make sense when we're in the DOM. Server-side renders
	// can call toCSS to get the updated CSS.
	if ( !doc || !isDirty ) return;

	if ( useCssText ) {
		styleElement.styleSheet.cssText = getCSS( null );
	} else {
		styleElement.innerHTML = getCSS( null );
	}

	isDirty = false;
}

export function getCSS( cssIds ) {

	const filteredStyleDefinitions = cssIds ? styleDefinitions.filter( style => ~cssIds.indexOf( style.id ) ) : styleDefinitions;

	return filteredStyleDefinitions.reduce( ( styles, style ) => `${styles}\n\n/* {${style.id}} */\n${style.styles}`, PREFIX );

}

// If we're on the browser, additional setup needed.
if ( doc && ( !styleElement || !styleElement.parentNode ) ) {

	styleElement = doc.createElement( 'style' );
	styleElement.type = 'text/css';

	doc.getElementsByTagName( 'head' )[ 0 ].appendChild( styleElement );

	useCssText = !!styleElement.styleSheet;
}
