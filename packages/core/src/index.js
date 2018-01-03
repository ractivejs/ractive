import './polyfills/array.find';
import './polyfills/node.contains';
import './polyfills/Object.assign';
import './polyfills/performance.now';
import './polyfills/Promise';
import './polyfills/requestAnimationFrame';

import defaults from './Ractive/config/defaults';
import easing from './Ractive/static/easing';
import interpolators from './Ractive/static/interpolators';
import { svg, win } from './config/environment';
import proto from './Ractive/prototype';
import { extend, extendWith } from './extend/_extend';
import parse from './parse/_parse';
import getContext, { getNodeInfo } from './Ractive/static/getContext';
import isInstance from './Ractive/static/isInstance';
import construct from './Ractive/construct';
import initialise from './Ractive/initialise';
import { getCSS } from './global/css';
import { escapeKey, unescapeKey, normalise } from './shared/keypaths';
import { joinKeys, splitKeypath } from './Ractive/static/keypaths';
import shared from './Ractive/shared';
import { findPlugin } from './Ractive/static/findPlugin';
import parseJSON from './utils/parseJSON';

export default function Ractive ( options ) {
	if ( !( this instanceof Ractive ) ) return new Ractive( options );

	construct( this, options || {} );
	initialise( this, options || {}, {} );
}

// check to see if we're being asked to force Ractive as a global for some weird environments
if ( win && !win.Ractive ) {
	let opts = '';
	const script = document.currentScript || /* istanbul ignore next */ document.querySelector( 'script[data-ractive-options]' );

	if ( script ) opts = script.getAttribute( 'data-ractive-options' ) || '';

	/* istanbul iggnore next */
	if ( ~opts.indexOf( 'ForceGlobal' ) ) win.Ractive = Ractive;
}

Object.assign( Ractive.prototype, proto, defaults );
Ractive.prototype.constructor = Ractive;

// alias prototype as `defaults`
Ractive.defaults = Ractive.prototype;

// share defaults with the parser
shared.defaults = Ractive.defaults;
shared.Ractive = Ractive;

// static properties
Object.defineProperties( Ractive, {

	// debug flag
	DEBUG:            { writable: true, value: true },
	DEBUG_PROMISES:   { writable: true, value: true },

	// static methods:
	extend:           { value: extend },
	extendWith:       { value: extendWith },
	escapeKey:        { value: escapeKey },
	getContext:       { value: getContext },
	getNodeInfo:      { value: getNodeInfo },
	isInstance:       { value: isInstance },
	joinKeys:         { value: joinKeys },
	parse:            { value: parse },
	splitKeypath:     { value: splitKeypath },
	unescapeKey:      { value: unescapeKey },
	getCSS:           { value: getCSS },
	normaliseKeypath: { value: normalise },
	findPlugin:       { value: findPlugin },
	evalObjectString: { value: parseJSON },

	// support
	enhance:          { writable: true, value: false },
	svg:              { value: svg },

	// version
	VERSION:          { value: 'BUILD_PLACEHOLDER_VERSION' },

	// plugins
	adaptors:         { writable: true, value: {} },
	components:       { writable: true, value: {} },
	decorators:       { writable: true, value: {} },
	easing:           { writable: true, value: easing },
	events:           { writable: true, value: {} },
	interpolators:    { writable: true, value: interpolators },
	partials:         { writable: true, value: {} },
	transitions:      { writable: true, value: {} },

	// for getting the source Ractive lib from a constructor
	Ractive:          { value: Ractive }
});
