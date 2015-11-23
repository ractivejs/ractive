import { test } from 'qunit';
import tests from 'samples/parse';

test( 'Mismatched template version causes error', function ( t ) {
	t.throws( function () {
		new Ractive({
			template: {v:'nope',t:[]}
		});
	});
});

tests.forEach( theTest => {
	test( theTest.name, function ( t ) {
		if ( theTest.error ) {
			t.throws( () => {
				Ractive.parse( theTest.template, theTest.options );
			}, error => {
				if ( error.name !== 'ParseError' ) {
					throw error;
				}
				t.equal( error.message, theTest.error );
				return true;
			}, 'Expected ParseError' );
		} else {
			const parsed = Ractive.parse( theTest.template, theTest.options );
			t.deepEqual( parsed, theTest.parsed );
		}
	});
});
