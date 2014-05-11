module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'build', [
		'jshint',
		'clean:tmp',
		'broccoli:toAmd:build',
		'requirejs',
		'concat:closure',
		'revision',
		'jsbeautifier'
	]);

};
