module.exports = function ( grunt ) {

	'use strict';

	var qunitConfig = {};

	grunt.file.expand( 'test/tests/**/*.html' ).forEach( function ( path ) {
		var testName = /test\/tests\/(.+)\.html/.exec( path )[1];

		if ( testName === 'index' ) {
			testName = 'all';
		}

		qunitConfig[ testName.replace(/\//g, '-') ] = path;
	});

	return qunitConfig;

};