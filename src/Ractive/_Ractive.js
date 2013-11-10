define([
	'utils/create',
	'utils/defineProperties',
	'Ractive/prototype/_prototype',
	'registries/partials',
	'registries/adaptors',
	'registries/easing',
	'extend/_extend',
	'parse/_parse',
	'Ractive/initialise'
], function (
	create,
	defineProperties,
	prototype,
	partialRegistry,
	adaptorRegistry,
	easingRegistry,
	Ractive_extend,
	parse,
	initialise
) {

	'use strict';

	var Ractive = function ( options ) {
		initialise( this, options );
	};

	// Prototype methods
	Ractive.prototype = prototype;
	Ractive.prototype.constructor = Ractive;

	// Shared properties - TODO make these read-only
	Ractive.partials = partialRegistry;
	Ractive.delimiters = [ '{{', '}}' ];
	Ractive.tripleDelimiters = [ '{{{', '}}}' ];

	// Plugins
	Ractive.adaptors = adaptorRegistry;
	Ractive.transitions = {};
	Ractive.events = Ractive.eventDefinitions = {};
	Ractive.easing = easingRegistry;
	Ractive.components = {};
	Ractive.decorators = {};

	// Static methods
	Ractive.extend = Ractive_extend;
	Ractive.parse = parse;

	Ractive.VERSION = '<%= version %>';

	return Ractive;

});