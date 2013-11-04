define([
	'utils/create',
	'utils/defineProperties',
	'Ractive/prototype/_index',
	'registries/partials',
	'Ractive/static/easing',
	'Ractive/static/extend',
	'Ractive/static/interpolate',
	'Ractive/static/interpolators',
	'parse/_index',
	'Ractive/initialise'
], function (
	create,
	defineProperties,
	prototype,
	partials,
	easing,
	Ractive_extend,
	interpolate,
	interpolators,
	parse,
	initialise
) {

	'use strict';

	var Ractive = function ( options ) {
		initialise( this, options, Ractive );
	};

	// Prototype methods
	Ractive.prototype = prototype;

	// Shared properties
	Ractive.partials = partials;
	Ractive.delimiters = [ '{{', '}}' ];
	Ractive.tripleDelimiters = [ '{{{', '}}}' ];

	// Plugins
	Ractive.adaptors = {};
	Ractive.transitions = {};
	Ractive.events = Ractive.eventDefinitions = {};
	Ractive.easing = easing;
	Ractive.components = {};
	Ractive.decorators = {};

	// Static methods
	Ractive.extend = Ractive_extend;
	Ractive.interpolate = interpolate;
	Ractive.interpolators = interpolators;
	Ractive.parse = parse;

	Ractive.VERSION = '<%= version %>';

	return Ractive;

});