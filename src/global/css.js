import { doc } from '../config/environment';

const PREFIX = '/* Ractive.js component styles */\n';

// Holds current definitions of styles
let styleDefinitions = [];

// Flag to tell if we need to update the CSS
let isDirty = false;

// These only make sense on the browser. See additional setup below.
let styleElement = null;
let styleSheet = null;
let styleProperty = null;

function add( styleDefinition ){
	styleDefinitions.push( styleDefinition );
	isDirty = true;
}

function toCSS(){
	return PREFIX + styleDefinitions.map( s => `\n/* {${s.id}} */\n${s.styles}` ).join( '\n' );
}

function apply(){

	// Apply only seems to make sense when we're in the DOM. Server-side renders
	// can call toCSS to get the updated CSS.
	if( !doc || !isDirty ) return;

	styleElement[styleProperty] = toCSS();

	isDirty = false;
}

// If we're on the browser, additional setup needed.
if(doc && (!styleElement || !styleElement.parentNode)){

	styleElement = doc.createElement( 'style' );
	styleElement.type = 'text/css';

	doc.getElementsByTagName( 'head' )[0].appendChild(styleElement);

	styleSheet = styleElement.styleSheet;

	styleProperty = styleSheet ? 'cssText' : 'innerHTML';
}

export default {
	add,
	apply,
	toCSS
};
