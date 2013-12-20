define([
	'utils/create',
	'utils/defineProperties',
	'Ractive/prototype/_prototype',
	'registries/partials',
	'registries/adaptors',
	'registries/easing',
	'extend/_extend',
	'parse/_parse',
	'Ractive/initialise',
	'circular'
], function (
	create,
	defineProperties,
	prototype,
	partialRegistry,
	adaptorRegistry,
	easingRegistry,
	Ractive_extend,
	parse,
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
		components:  { value: {} },
		decorators:  { value: {} },

		VERSION:     { value: '<%= version %>' }
	});

	// TODO deprecated
	Ractive.eventDefinitions = Ractive.events;

	Ractive.prototype.constructor = Ractive;

	Ractive.delimiters = [ '{{', '}}' ];
	Ractive.tripleDelimiters = [ '{{{', '}}}' ];

	// Static methods
	Ractive.extend = Ractive_extend;
	Ractive.parse = parse;

	circular.Ractive = Ractive;
	return Ractive;

});