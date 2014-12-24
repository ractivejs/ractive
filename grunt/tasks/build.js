module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'build', [
		'jshint',
		'clean:tmpDir',
		'buildTests',
		'gobble:toTmpDir',
		'revision',
		'jsbeautifier',
		'clean:tmp'
	]);

};
