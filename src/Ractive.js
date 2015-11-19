import defaults from './Ractive/config/defaults';
import easing from './Ractive/static/easing';
import interpolators from './Ractive/static/interpolators';
import { magic, svg, win } from './config/environment';
import { defineProperties, extend as extendObj } from './utils/object';
import proto from './Ractive/prototype';
import Promise from './utils/Promise';
import extend from './extend/_extend';
import parse from './parse/_parse';
import getNodeInfo from './Ractive/static/getNodeInfo';
import construct from './Ractive/construct';
import initialise from './Ractive/initialise';

// Ractive.js makes liberal use of things like Array.prototype.indexOf. In
// older browsers, these are made available via a shim - here, we do a quick
// pre-flight check to make sure that either a) we're not in a shit browser,
// or b) we're using a Ractive-legacy.js build
const FUNCTION = 'function';

if (
	typeof Date.now !== FUNCTION                 ||
	typeof String.prototype.trim !== FUNCTION    ||
	typeof Object.keys !== FUNCTION              ||
	typeof Array.prototype.indexOf !== FUNCTION  ||
	typeof Array.prototype.forEach !== FUNCTION  ||
	typeof Array.prototype.map !== FUNCTION      ||
	typeof Array.prototype.filter !== FUNCTION   ||
	( win && typeof win.addEventListener !== FUNCTION )
) {
	throw new Error( `It looks like you're attempting to use Ractive in an older browser. You should include https://github.com/es-shims/es5-shim (or equivalent) in your project before ractive.js` );
}

export default function Ractive ( options ) {
	if ( !( this instanceof Ractive ) ) return new Ractive( options );

	construct( this, options || {} );
	initialise( this, options || {}, {} );
}

extendObj( Ractive.prototype, proto, defaults );
Ractive.prototype.constructor = Ractive;

// alias prototype as `defaults`
Ractive.defaults = Ractive.prototype;

// static properties
defineProperties( Ractive, {

	// debug flag
	DEBUG:          { writable: true, value: true },
	DEBUG_PROMISES: { writable: true, value: true },

	// static methods:
	extend:         { value: extend },
	getNodeInfo:    { value: getNodeInfo },
	parse:          { value: parse },

	// namespaced constructors
	Promise:        { value: Promise },

	// support
	enhance:        { writable: true, value: false },
	svg:            { value: svg },
	magic:          { value: magic },

	// version
	VERSION:        { value: '<@version@>' },

	// plugins
	adaptors:       { writable: true, value: {} },
	components:     { writable: true, value: {} },
	decorators:     { writable: true, value: {} },
	easing:         { writable: true, value: easing },
	events:         { writable: true, value: {} },
	interpolators:  { writable: true, value: interpolators },
	partials:       { writable: true, value: {} },
	transitions:    { writable: true, value: {} }
});
