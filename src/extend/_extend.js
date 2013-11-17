define([
	'config/errors',
	'config/isClient',
	'utils/create',
	'utils/isObject',
	'parse/_parse',
	'Ractive/initialise',
	'registries/adaptors',
	'extend/utils/augment',
	'extend/utils/clone',
	'extend/utils/fillGaps',
	'extend/inheritFromParent',
	'extend/inheritFromChildProps',
	'extend/wrapMethod',
	'extend/extractInlinePartials',
	'extend/conditionallyParseTemplate',
	'extend/conditionallyParsePartials',
	'extend/initChildInstance'
], function (
	errors,
	isClient,
	create,
	isObject,
	parse,
	initialise,
	adaptorRegistry,
	augment,
	clone,
	fillGaps,
	inheritFromParent,
	inheritFromChildProps,
	wrapMethod,
	extractInlinePartials,
	conditionallyParseTemplate,
	conditionallyParsePartials,
	initChildInstance
) {

	'use strict';

	return function ( childProps ) {

		var Parent = this, Child;

		// create Child constructor
		Child = function ( options ) {
			initChildInstance( this, Child, options || {});
		};

		Child.prototype = create( Parent.prototype );

		// Inherit options from parent, if we're extending a subclass.
		// This next line is just a way to determine if we're extending
		// the base class, without introducing a circular dependency
		if ( Parent.adaptors !== adaptorRegistry ) {
			inheritFromParent( Child, Parent );
		}

		// apply childProps
		inheritFromChildProps( Child, childProps );

		// parse template and any partials that need it
		conditionallyParseTemplate( Child );
		extractInlinePartials( Child, childProps );
		conditionallyParsePartials( Child );
		
		Child.extend = Parent.extend;

		return Child;
	};

});