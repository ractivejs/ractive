module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'default', [
		'build',
		'test',
		'uglify',
		'concat:banner'
	]);

};
