define([
	'config/svg',
	'utils/create',
	'utils/defineProperties',
	'Ractive/prototype/_prototype',
	'registries/partials',
	'registries/adaptors',
	'registries/components',
	'registries/easing',
	'extend/_extend',
	'parse/_parse',
	'load/_load',
	'Ractive/initialise',
	'circular'
], function (
	svg,
	create,
	defineProperties,
	prototype,
	partialRegistry,
	adaptorRegistry,
	componentsRegistry,
	easingRegistry,
	extend,
	parse,
	load,
	initialise,
	circular
) {

	'use strict';

	var Ractive = function ( options ) {
		initialise( this, options );
	};

	// Read-only properties
	defineProperties( Ractive, {

		// Prototype methods
		prototype: { value: prototype },

		// Shared properties
		partials: { value: partialRegistry },

		// Plugins
		adaptors:    { value: adaptorRegistry },
		easing:      { value: easingRegistry },
		transitions: { value: {} },
		events:      { value: {} },
		components:  { value: componentsRegistry },
		decorators:  { value: {} },

		// Support
		svg: { value: svg },

		VERSION:     { value: '<%= version %>' }
	});

	// TODO deprecated
	Ractive.eventDefinitions = Ractive.events;

	Ractive.prototype.constructor = Ractive;

	Ractive.delimiters = [ '{{', '}}' ];
	Ractive.tripleDelimiters = [ '{{{', '}}}' ];

	// Static methods
	Ractive.extend = extend;
	Ractive.parse = parse;
	Ractive.load = load;

	circular.Ractive = Ractive;
	return Ractive;

});