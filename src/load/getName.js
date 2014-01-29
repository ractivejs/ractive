define([

], function (

) {

	'use strict';

	return function ( path ) {
		var pathParts, filename, lastIndex;

		pathParts = path.split( '/' );
		filename = pathParts.pop();

		lastIndex = filename.lastIndexOf( '.' );
		if ( lastIndex !== -1 ) {
			filename = filename.substr( 0, lastIndex );
		}

		return filename;
	};

});
