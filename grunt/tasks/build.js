module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'build', [
		'jshint',
		'clean:tmp',
		'transpile',
		'copy:transpiled',
		'requirejs',
		'concat:closure',
		'revision',
		'jsbeautifier'
	]);

};
