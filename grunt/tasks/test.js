module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'buildTests', [
		'clean:tests',
		'copy:testModules',
		'copy:testIndex'
	]);

	grunt.registerTask( 'test', [
		'buildTests',
		'nodeunit',
		'qunit:all'
	]);

};
