// PARSING TESTS
// =============
//
// TODO: add moar samples
import tests from 'samples/parse';

module( 'Parse' );

test( 'Mismatched template version causes error', function ( t ) {
	t.throws( function () {
		var ractive = new Ractive({
			template: {v:'nope',t:[]}
		});
	});
});

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
