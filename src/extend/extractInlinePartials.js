define([
	'utils/isObject',
	'extend/utils/augment'
], function (
	isObject,
	augment
) {

	'use strict';

	return function ( Child, childProps ) {
		// does our template contain inline partials?
		if ( isObject( Child.defaults.template ) ) {
			if ( !Child.partials ) {
				Child.partials = {};
			}

			// get those inline partials
			augment( Child.partials, Child.defaults.template.partials );

			// but we also need to ensure that any explicit partials override inline ones
			if ( childProps.partials ) {
				augment( Child.partials, childProps.partials );
			}

			// move template to where it belongs
			Child.defaults.template = Child.defaults.template.main;
		}
	};

});
