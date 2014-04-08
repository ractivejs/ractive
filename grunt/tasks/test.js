module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'test', [
		'nodeunit',
		'qunit:all'
	]);

};
