define([
	'shared/createComponentBinding'
], function (
	createComponentBinding
) {

	'use strict';

	return function ( component, toBind ) {
		toBind.forEach( function ( pair ) {
			createComponentBinding( component, component.root, pair.parentKeypath, pair.childKeypath );
		});
	};

});
