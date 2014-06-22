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
					t.throws( function () {
						Ractive.parse( theTest.template, theTest.options );
					}, function ( error ) {
						if (error.name !== 'ParseError') {
							throw error;
						}
						t.equal( error.message, theTest.error );
						return true;
					}, 'Expected ParseError');
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
