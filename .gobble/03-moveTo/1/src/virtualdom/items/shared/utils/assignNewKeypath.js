define(['virtualdom/items/shared/utils/startsWith','virtualdom/items/shared/utils/getNewKeypath'],function (startsWith, getNewKeypath) {

	'use strict';
	
	return function assignNewKeypath ( target, property, oldKeypath, newKeypath ) {
		var existingKeypath = target[ property ];
	
		if ( !existingKeypath || startsWith( existingKeypath, newKeypath ) || !startsWith( existingKeypath, oldKeypath ) ) {
			return;
		}
	
		target[ property ] = getNewKeypath( existingKeypath, oldKeypath, newKeypath );
	};

});