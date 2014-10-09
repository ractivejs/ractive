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

	grunt.registerTask( 'release', [
		'build',
		'concurrent:test',
		'concurrent:uglify',
		'concat:banner'
	]);

};
