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
import { escapeKey, unescapeKey } from './shared/keypaths';
import { joinKeys, splitKeypath } from './Ractive/static/keypaths';

export default function Ractive ( options ) {
	if ( !( this instanceof Ractive ) ) return new Ractive( options );

	construct( this, options || {} );
	initialise( this, options || {}, {} );
}

// check to see if we're being asked to force Ractive as a global for some weird environments
if ( win && !win.Ractive ) {
	let opts = '';
	const script = document.currentScript || document.querySelector( 'script[data-ractive-options]' );

	if ( script ) {
		opts = script.getAttribute( 'data-ractive-options' ) || '';
	}

	if ( ~opts.indexOf( 'ForceGlobal' ) ) {
		win.Ractive = Ractive;
	}
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
	escapeKey:      { value: escapeKey },
	getNodeInfo:    { value: getNodeInfo },
	joinKeys:       { value: joinKeys },
	parse:          { value: parse },
	splitKeypath:   { value: splitKeypath },
	unescapeKey:    { value: unescapeKey },
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
