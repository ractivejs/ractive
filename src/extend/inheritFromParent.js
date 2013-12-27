define([
	'extend/registries',
	'extend/initOptions',
	'utils/create'
], function (
	registries,
	initOptions,
	create
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

		initOptions.forEach( function ( property ) {
			Child[ property ] = Parent[ property ];
		});
	};

});