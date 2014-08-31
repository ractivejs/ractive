define(['utils/removeFromArray'],function (removeFromArray) {

	'use strict';
	
	return function unbindOption ( option ) {
		if ( option.select ) {
			removeFromArray( option.select.options, option );
		}
	};

});