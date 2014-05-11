// PARSING TESTS
// =============
//
// TODO: add moar samples

define([ 'ractive', 'samples/parse' ], function ( Ractive, tests ) {

	return function () {

		module( 'Parse' );

		runTest = function ( theTest ) {
			test( theTest.name, function ( t ) {
				if (theTest.error) {
					var error = "No error thrown";
					try {
						Ractive.parse( theTest.template, theTest.options );
					} catch (e) {
						if ( e.name !== 'ParseError' ) throw e;
						error = String(e.message || e);
					}
					t.deepEqual(error, theTest.error);
				} else {
					var parsed = Ractive.parse( theTest.template, theTest.options );

					t.deepEqual( parsed, theTest.parsed );
				}
			});
		};

		for ( i=0; i<tests.length; i+=1 ) {
			runTest( tests[i] );
		}

	};

});
