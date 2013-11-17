define([
	'extend/extendable',
	'extend/inheritable',
	'extend/utils/clone'
], function (
	extendable,
	inheritable,
	clone
) {
	
	'use strict';

	return function ( Child, Parent ) {
		extendable.forEach( function ( property ) {
			if ( Parent[ property ] ) {
				Child[ property ] = clone( Parent[ property ] );
			}
		});

		inheritable.forEach( function ( property ) {
			if ( Parent[ property ] !== undefined ) {
				Child[ property ] = Parent[ property ];
			}
		});
	};

});