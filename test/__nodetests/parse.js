/*global require, describe, it */
var Ractive = require( '../../ractive' ),
	assert = require( 'assert' ),
	parseTests = require( './samples/parse' );

describe( 'Ractive.parse()', function () {
	parseTests.forEach( function ( test ) {
		it( test.name, function () {
			if (test.error) {
				assert.throws( function () {
					Ractive.parse( test.template, test.options );
				}, function ( error ) {
					if (error.name !== 'ParseError') {
						throw error;
					}
					assert.equal( error.message, test.error );
					return true;
				}, 'Expected ParseError');
			} else {
				var parsed = Ractive.parse( test.template, test.options );
				assert.deepEqual( parsed, test.parsed );
			}
		});
	});

});