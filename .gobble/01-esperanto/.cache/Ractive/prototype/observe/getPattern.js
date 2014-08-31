define(['shared/getMatchingKeypaths'],function (getMatchingKeypaths) {

	'use strict';
	
	return function getPattern ( ractive, pattern ) {
		var matchingKeypaths, values;
	
		matchingKeypaths = getMatchingKeypaths( ractive, pattern );
	
		values = {};
		matchingKeypaths.forEach( keypath => {
			values[ keypath ] = ractive.get( keypath );
		});
	
		return values;
	};

});