define([
	'shared/createComponentBinding',
	'shared/get/_get',
	'shared/set'
], function (
	createComponentBinding,
	get,
	set
) {

	'use strict';

	return function createInitialComponentBindings ( component, toBind ) {
		toBind.forEach( function createInitialComponentBinding ( pair ) {
			var childValue, parentValue;

			createComponentBinding( component, component.root, pair.parentKeypath, pair.childKeypath );

			childValue = get( component.instance, pair.childKeypath );
			parentValue = get( component.root, pair.parentKeypath );

			if ( childValue !== undefined && parentValue === undefined ) {
				set( component.root, pair.parentKeypath, childValue );
			}
		});
	};

});
