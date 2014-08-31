define(['config/defaults/options','config/defaults/easing','config/defaults/interpolators','config/svg','config/magic','utils/defineProperties','Ractive/prototype','utils/Promise','utils/extend','extend/_extend','parse/_parse','Ractive/initialise','circular'],function (defaults, easing, interpolators, svg, magic, defineProperties, proto, Promise, extendObj, extend, parse, initialise, circular) {

	'use strict';
	
	var Ractive, properties;
	
	// Main Ractive required object
	Ractive = function ( options ) {
		initialise( this, options );
	};
	
	
	// Ractive properties
	properties = {
	
		// static methods:
		extend:        { value: extend },
		parse:         { value: parse },
	
		// Namespaced constructors
		Promise:       { value: Promise },
	
		// support
		svg:           { value: svg },
		magic:         { value: magic },
	
		// version
		VERSION:       { value: '<%= pkg.version %>' },
	
		// Plugins
		adaptors:      { writable: true, value: {} },
		components:    { writable: true, value: {} },
		decorators:    { writable: true, value: {} },
		easing:        { writable: true, value: easing },
		events:        { writable: true, value: {} },
		interpolators: { writable: true, value: interpolators },
		partials:      { writable: true, value: {} },
		transitions:   { writable: true, value: {} }
	};
	
	
	// Ractive properties
	defineProperties( Ractive, properties );
	
	Ractive.prototype = extendObj( proto, defaults );
	
	Ractive.prototype.constructor = Ractive;
	
	// alias prototype as defaults
	Ractive.defaults = Ractive.prototype;
	
	
	
	// Certain modules have circular dependencies. If we were bundling a
	// module loader, e.g. almond.js, this wouldn't be a problem, but we're
	// not - we're using amdclean as part of the build process. Because of
	// this, we need to wait until all modules have loaded before those
	// circular dependencies can be required.
	circular.Ractive = Ractive;
	
	while ( circular.length ) {
		circular.pop()();
	}
	
	// Ractive.js makes liberal use of things like Array.prototype.indexOf. In
	// older browsers, these are made available via a shim - here, we do a quick
	// pre-flight check to make sure that either a) we're not in a shit browser,
	// or b) we're using a Ractive-legacy.js build
	var FUNCTION = 'function';
	
	if (
		typeof Date.now !== FUNCTION                 ||
		typeof String.prototype.trim !== FUNCTION    ||
		typeof Object.keys !== FUNCTION              ||
		typeof Array.prototype.indexOf !== FUNCTION  ||
		typeof Array.prototype.forEach !== FUNCTION  ||
		typeof Array.prototype.map !== FUNCTION      ||
		typeof Array.prototype.filter !== FUNCTION   ||
		( typeof window !== 'undefined' && typeof window.addEventListener !== FUNCTION )
	) {
		throw new Error( 'It looks like you\'re attempting to use Ractive.js in an older browser. You\'ll need to use one of the \'legacy builds\' in order to continue - see http://docs.ractivejs.org/latest/legacy-builds for more information.' );
	}
	
	return Ractive;

});