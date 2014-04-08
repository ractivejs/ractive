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

		//TODO: create structure like above to run parsing error tests
		test('Illegal closing section: ref mismatch', function(t){
			throws( function(){
				Ractive.parse( '{{#foo}}{{/bar}}' );
			},
			/(?=.*foo)(?=.*bar)/)
		});

		test('Illegal closing section: closing must be contained in openning', function(t){
			throws( function(){
				Ractive.parse( '{{#foo}}{{/foo:i}}' );
			},
			/(?=.*foo)(?=.*foo:i)/)
		});

	};

});
