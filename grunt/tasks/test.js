module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'buildTests', [
		'clean:tests',
		'copy:testModules',
		'copy:testIndex'
	]);

	grunt.registerTask( 'test', [
		'build',
		'runTests'
	]);

	grunt.registerTask( 'runTests', [
		'nodeunit',
		'qunit:all'
	]);

};
