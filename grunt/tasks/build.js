module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'build', [
		'jshint',
		'clean:tmpDir',
		'buildTests',
		'broccoli:toTmpDir:build',
		'requirejs',
		'concat:closure',
		'revision',
		'jsbeautifier'
	]);

};
