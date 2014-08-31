define(['legacy'],function () {

	'use strict';
	
	return function createOptionGroup ( keys, config ) {
		var group = keys.map( config );
	
		keys.forEach( function( key, i )  {
			group[ key ] = group[ i ];
		});
	
		return group;
	};

});