define([
	'utils/create',
	'utils/defineProperties',
	'utils/getGuid',
	'extend/inheritFromParent',
	'extend/inheritFromChildProps',
	'extend/extractInlinePartials',
	'extend/conditionallyParseTemplate',
	'extend/conditionallyParsePartials',
	'extend/initChildInstance',
	'circular'
], function (
	create,
	defineProperties,
	getGuid,
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

		defineProperties( Child, {
			extend: { value: Parent.extend },

			// each component needs a guid, for managing CSS etc
			_guid: { value: getGuid() }
		});

		return Child;
	};

});