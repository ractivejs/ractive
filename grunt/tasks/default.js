module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'default', [
		'test',
		'clean:build',
		'concat',
		'jsbeautifier',
		'uglify'
	]);

};