define([
	'shared/createComponentBinding',
	'shared/get/_get'
], function (
	createComponentBinding,
	get
) {

	'use strict';

	return function createInitialComponentBindings ( component, toBind ) {
		toBind.forEach( function createInitialComponentBinding ( pair ) {
			var childValue;

			createComponentBinding( component, component.root, pair.parentKeypath, pair.childKeypath );

			childValue = get( component.instance, pair.childKeypath );
			if ( childValue !== undefined ) {
				component.root.set( pair.parentKeypath, childValue );
			}
		});
	};

});
