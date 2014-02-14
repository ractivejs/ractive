define([
	'shared/createComponentBinding',
	'shared/get/_get',
	'shared/set/_set'
], function (
	createComponentBinding,
	get,
	set
) {

	'use strict';

	return function createInitialComponentBindings ( component, toBind ) {
		toBind.forEach( function createInitialComponentBinding ( pair ) {
			var childValue;

			createComponentBinding( component, component.root, pair.parentKeypath, pair.childKeypath );

			childValue = get( component.instance, pair.childKeypath );
			if ( childValue !== undefined ) {
				set( component.root, pair.parentKeypath, childValue );
			}
		});
	};

});
