define([
	'shared/createComponentBinding'
], function (
	createComponentBinding
) {

	'use strict';

	return function ( component, toBind ) {
		toBind.forEach( function ( pair ) {
			var childValue;

			createComponentBinding( component, component.root, pair.parentKeypath, pair.childKeypath );

			childValue = component.instance.get( pair.childKeypath );
			if ( childValue !== undefined ) {
				component.root.set( pair.parentKeypath, childValue );
			}
		});
	};

});
