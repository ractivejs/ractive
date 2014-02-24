module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'test', [
		'clean:tmp',
		'jshint',
		'requirejs',
		'nodeunit',
		'qunit:all'
	]);

};