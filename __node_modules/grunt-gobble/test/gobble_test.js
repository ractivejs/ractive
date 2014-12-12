'use strict';

var grunt = require( 'grunt' ),
	spelunk = require( 'spelunk' );

/*
	======== A Handy Little Nodeunit Reference ========
	https://github.com/caolan/nodeunit

	Test methods:
		test.expect(numAssertions)
		test.done()
	Test assertions:
		test.ok(value, [message])
		test.equal(actual, expected, [message])
		test.notEqual(actual, expected, [message])
		test.deepEqual(actual, expected, [message])
		test.notDeepEqual(actual, expected, [message])
		test.strictEqual(actual, expected, [message])
		test.notStrictEqual(actual, expected, [message])
		test.throws(block, [error], [message])
		test.doesNotThrow(block, [error], [message])
		test.ifError(value)
*/

exports.gobble = {
	setUp: function(done) {
		// setup here if necessary
		done();
	},
	default_options: function(test) {
		test.expect(1);

		spelunk( 'tmp/default', function ( err, actual ) {
			if ( err ) { throw err; }
			spelunk( 'test/expected/default', function ( err, expected ) {
				if ( err ) { throw err; }
				test.deepEqual( actual, expected, 'should build correctly using the gobblefile build config.' );

				test.done();
			});
		});
	},
	custom_options: function(test) {
		test.expect(1);

		spelunk( 'tmp/custom', function ( err, actual ) {
			if ( err ) { throw err; }
			spelunk( 'test/expected/custom', function ( err, expected ) {
				if ( err ) { throw err; }
				test.deepEqual( actual, expected, 'should build correctly using a custom config.' );

				test.done();
			});
		});
	},
};
