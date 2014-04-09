module.exports = function ( grunt ) {

	'use strict';

	var nodeunitConfig = {};

	grunt.file.expand( 'test/node/*.js' ).forEach( function ( path ) {
		var testName = /test\/node\/(.+)\.js/.exec( path )[1];

		nodeunitConfig[ testName ] = path;
	});

	return nodeunitConfig;

};
