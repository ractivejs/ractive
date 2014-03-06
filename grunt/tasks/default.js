module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'default', [
		'test',
		'clean:build',
		'revision',
		'concat',
		'jsbeautifier',
		'uglify'
	]);

};