module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'build', [
		'jshint',
		'clean:tmp',
		'requirejs',
		'concat:closure',
		'revision',
		'jsbeautifier'
	]);

};
