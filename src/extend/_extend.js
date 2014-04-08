define([
	'utils/create',
	'utils/defineProperties',
	'utils/getGuid',
	'utils/extend',
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
	extendObject,
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

	return function extend ( childProps ) {

		var Parent = this, Child, adaptor, i;

		// if we're extending with another Ractive instance, inherit its
		// prototype methods and default options as well
		if ( childProps.prototype instanceof Ractive ) {
			childProps = ( extendObject( {}, childProps, childProps.prototype, childProps.defaults ) );
		}

		// create Child constructor
		Child = function ( options ) {
			initChildInstance( this, Child, options || {});
		};

		Child.prototype = create( Parent.prototype );
		Child.prototype.constructor = Child;

		defineProperties( Child, {
			extend: { value: Parent.extend },

			// each component needs a guid, for managing CSS etc
			_guid: { value: getGuid() }
		});

		// Inherit options from parent
		inheritFromParent( Child, Parent );

		// Add new prototype methods and init options
		inheritFromChildProps( Child, childProps );

		// Special case - adaptors. Convert to function if possible
		if ( Child.adaptors && ( i = Child.defaults.adapt.length ) ) {
			while ( i-- ) {
				adaptor = Child.defaults.adapt[i];
				if ( typeof adaptor === 'string' ) {
					Child.defaults.adapt[i] = Child.adaptors[ adaptor ] || adaptor;
				}
			}
		}

		// Parse template and any partials that need it
		if ( childProps.template ) { // ignore inherited templates!
			conditionallyParseTemplate( Child );
			extractInlinePartials( Child, childProps );
			conditionallyParsePartials( Child );
		}

		return Child;
	};

});
