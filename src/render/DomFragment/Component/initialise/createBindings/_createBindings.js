define([
	'render/DomFragment/Component/initialise/createBindings/createBinding'
], function (
	createBinding
) {

	'use strict';

	return function ( component, toBind ) {
		var pair, i;

		component.bindings = [];

		i = toBind.length;
		while ( i-- ) {
			pair = toBind[i];
			createBinding( component, component.root, pair.parentKeypath, pair.childKeypath );
		}
	};

});
