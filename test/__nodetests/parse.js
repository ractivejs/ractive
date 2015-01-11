var Ractive, parseTests;

Ractive = require( '../../src/ractive' );
parseTests = require( '../samples/parse' );

parseTests.forEach( function ( theTest ) {
	exports[ theTest.name ] = function ( test ) {
		if (theTest.error) {
			test.throws( function () {
				Ractive.parse( theTest.template, theTest.options );
			}, function ( error ) {
				if (error.name !== 'ParseError') {
					throw error;
				}
				test.equal( error.message, theTest.error );
				return true;
			}, 'Expected ParseError');
		} else {
			var parsed = Ractive.parse(theTest.template, theTest.options);

			test.deepEqual(parsed, theTest.parsed);
		}

		test.done();
	};
});
