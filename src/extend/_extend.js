define([
	'utils/create',
	'extend/inheritFromParent',
	'extend/inheritFromChildProps',
	'extend/extractInlinePartials',
	'extend/conditionallyParseTemplate',
	'extend/conditionallyParsePartials',
	'extend/initChildInstance',
	'circular'
], function (
	create,
	inheritFromParent,
	inheritFromChildProps,
	extractInlinePartials,
	conditionallyParseTemplate,
	conditionallyParsePartials,
	initChildInstance,
	circular
) {

	'use strict';

	var Ractive;

	circular.push( function () {
		Ractive = circular.Ractive;
	});

	return function ( childProps ) {

		var Parent = this, Child;

		// create Child constructor
		Child = function ( options ) {
			initChildInstance( this, Child, options || {});
		};

		Child.prototype = create( Parent.prototype );
		Child.prototype.constructor = Child;

		// Inherit options from parent
		inheritFromParent( Child, Parent );
		
		// Add new prototype methods and init options
		inheritFromChildProps( Child, childProps );
		
		// Parse template and any partials that need it
		conditionallyParseTemplate( Child );
		extractInlinePartials( Child, childProps );
		conditionallyParsePartials( Child );
		
		Child.extend = Parent.extend;

		return Child;
	};

});