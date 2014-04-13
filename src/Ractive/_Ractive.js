define([
	'config/initOptions',
	'config/svg',
	'utils/defineProperties',
	'Ractive/prototype/_prototype',
	'registries/partials',
	'registries/adaptors',
	'registries/components',
	'registries/easing',
	'registries/interpolators',
	'utils/Promise',
	'extend/_extend',
	'parse/_parse',
	'Ractive/initialise',
	'circular'
], function (
	initOptions,
	svg,
	defineProperties,
	proto,
	partialRegistry,
	adaptorRegistry,
	componentsRegistry,
	easingRegistry,
	interpolatorsRegistry,
	Promise,
	extend,
	parse,
	initialise,
	circular
) {

	'use strict';

	// Main Ractive required object
	var Ractive = function ( options ) {
		initialise( this, options );
	};

	Ractive.prototype = proto;

	// Read-only properties
	defineProperties( Ractive, {

		// Shared properties
		partials: { value: partialRegistry },

		// Plugins
		adaptors:      { value: adaptorRegistry },
		easing:        { value: easingRegistry },
		transitions:   { value: {} },
		events:        { value: {} },
		components:    { value: componentsRegistry },
		decorators:    { value: {} },
		interpolators: { value: interpolatorsRegistry },

		// Default options
		defaults:    { value: initOptions.defaults },

		// Support
		svg: { value: svg },

		VERSION:     { value: '<%= pkg.version %>' }
	});

	// TODO deprecated
	Ractive.eventDefinitions = Ractive.events;

	Ractive.prototype.constructor = Ractive;

	// Namespaced constructors
	Ractive.Promise = Promise;

	// Static methods
	Ractive.extend = extend;
	Ractive.parse = parse;

	circular.Ractive = Ractive;
	return Ractive;

});
