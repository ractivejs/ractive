module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'default', [
		'build',
		'runTests',
		'uglify',
		'concat:banner'
	]);

};
