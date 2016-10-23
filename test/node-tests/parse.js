var parseTests = require( './samples/parse' );

QUnit.module( 'Ractive.parse()' );

parseTests.forEach( function ( test ) {

	// disable for tests unless explicitly specified
	// we can just test the signatures, so set csp false
	test.options = test.options || { csp: false };
	if ( !test.options.hasOwnProperty( 'csp' ) ) {
		test.options.csp = false;
	}

	QUnit.test( test.name, function ( assert ) {
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
