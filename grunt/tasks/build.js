module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'build', [
		'jshint',
		'clean:tmpDir',
		'buildTests',
		'gobble:toTmpDir',
		'concurrent:requirejs',
		'concat:closure',
		'revision',
		'jsbeautifier',
		'clean:tmp'
	]);

};
