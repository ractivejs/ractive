module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'promises-aplus-tests', 'Run the Promises/A+ test suite.', function () {
		var promisesAplusTests, adaptor, done;

		promisesAplusTests = require( 'promises-aplus-tests' );
		adaptor = require( '../../test/promises-aplus-adaptor' );

		done = this.async();

		promisesAplusTests( adaptor, { reporter: 'dot' }, done );
	});

};