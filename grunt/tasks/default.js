module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'default', [
		'build',
		'concurrent:test',
		'concurrent:uglify',
		'concat:banner',
		'copy:main'
	]);

};
