// PARSING TESTS
// =============
//
// TODO: add moar samples

define([ 'ractive', 'samples/parse' ], function ( Ractive, tests ) {

	return function () {

		module( 'Parse' );

		var runTest = function ( theTest ) {
			test( theTest.name, function ( t ) {
				if (theTest.error) {
					var error;

					try {
						Ractive.parse( theTest.template, theTest.options );
					} catch (e) {
						error = e;
					}

					t.equal( error.name, 'ParseError' )
					t.ok( error.stack );
					t.equal( error.message, theTest.error );
				} else {
					var parsed = Ractive.parse( theTest.template, theTest.options );

					t.deepEqual( parsed, theTest.parsed );
				}
			});
		};

		for ( var i=0; i<tests.length; i+=1 ) {
			runTest( tests[i] );
		}

	};

});
