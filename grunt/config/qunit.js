module.exports = function ( grunt ) {

	'use strict';

	var qunitConfig = {},
		tests = grunt.template.process( '<%= tmpDir %>/test/tests/**/*.html' );

	grunt.file.expand( tests ).forEach( function ( path ) {
		var testName = /test\/tests\/(.+)\.html/.exec( path )[1];

		if ( testName === 'index' ) {
			testName = 'all';
		}

		qunitConfig[ testName.replace(/\//g, '-') ] = path;
	});

	return qunitConfig;

};
