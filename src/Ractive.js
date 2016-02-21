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
import { getCSS } from './global/css';
import { LEGACY_PLATFORM } from './messages/errors';
import noop from './utils/noop';
import { fatal, warnOnceIfDebug } from './utils/log';
import { DEBUG_WELCOME, DEBUG_ENABLED, PROMISE_DEBUG_ENABLED } from './messages/warnings';

// Ractive.js makes liberal use of things like Array.prototype.indexOf. In
// older browsers, these are made available via a shim - here, we do a quick
// pre-flight check to make sure that either a) we're not in a shit browser,
// or b) we're using a Ractive-legacy.js build

const requiredFunctions = [
	// ES5
	Date.now,
	Object.keys,
	String.prototype.trim,
	Array.prototype.indexOf,
	Array.prototype.forEach,
	Array.prototype.map,
	Array.prototype.filter,
	Array.prototype.reduce,
	Array.prototype.every,
	Function.prototype.bind,
	// ES6
	Promise,
	// HTML5
	win ? win.requestAnimationFrame : noop,
	// Not in IE
	win ? win.addEventListener : noop,
	win ? win.getComputedStyle : noop
];

for ( let i = 0; i < requiredFunctions.length; i++ ) {
	if ( typeof requiredFunctions[i] !== 'function' ) {
		fatal( LEGACY_PLATFORM );
	}
}

export default function Ractive ( options ) {
	if ( !( this instanceof Ractive ) ) return new Ractive( options );

	// Moved debug mode warnings out here. They're more of pre-flight checks than
	// construction or initialization warnings. But they need to happen after the
	// user has the chance to set them to false. So... here.
	warnOnceIfDebug( DEBUG_WELCOME, Ractive.VERSION );
	warnOnceIfDebug( DEBUG_ENABLED );
	warnOnceIfDebug( PROMISE_DEBUG_ENABLED );

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
	getCSS:         { value: getCSS },

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

