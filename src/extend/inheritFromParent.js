define([
	'config/registries',
	'utils/create',
	'utils/defineProperty',
	'extend/utils/transformCss'
], function (
	registries,
	create,
	defineProperty,
	transformCss
) {

	'use strict';

	// This is where we inherit class-level options, such as `modifyArrays`
	// or `append` or `twoway`, and registries such as `partials`

	return function ( Child, Parent ) {
		registries.forEach( function ( property ) {
			if ( Parent[ property ] ) {
				Child[ property ] = create( Parent[ property ] );
			}
		});

		defineProperty( Child, 'defaults', {
			value: create( Parent.defaults )
		});

		// Special case - CSS
		if ( Parent.css ) {
			defineProperty( Child, 'css', {
				value: Parent.defaults.noCssTransform
					? Parent.css
					: transformCss( Parent.css, Child._guid )
			});
		}
	};

});
