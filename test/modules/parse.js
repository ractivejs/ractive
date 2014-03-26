// PARSING TESTS
// =============
//
// TODO: add moar samples

define([ 'ractive', 'samples/parse' ], function ( Ractive, tests ) {

	return function () {

		module( 'Parse' );

		runTest = function ( theTest ) {
			test( theTest.name, function ( t ) {
				var parsed = Ractive.parse( theTest.template, theTest.options );

				t.deepEqual( parsed, theTest.parsed );
			});
		};

		for ( i=0; i<tests.length; i+=1 ) {
			runTest( tests[i] );
		}

	};

});
