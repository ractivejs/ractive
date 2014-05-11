var Ractive, parseTests;

Ractive = require( '../../tmp/ractive' );
parseTests = require( '../samples/parse' );

parseTests.forEach( function ( theTest ) {
	exports[ theTest.name ] = function ( test ) {
		if (theTest.error) {
			var error = "<No error thrown>";
			try {
				Ractive.parse(theTest.template, theTest.options);
			} catch (e) {
				error = String(e.message || e);
			}
			test.deepEqual(error, theTest.error);
		} else {
			var parsed = Ractive.parse(theTest.template, theTest.options);

			test.deepEqual(parsed, theTest.parsed);
		}

		test.done();
	};
});
