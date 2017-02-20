import { initModule } from '../../helpers/test-config';

export default function() {
	initModule( 'methods/subtract.js' );

	QUnit.test( 'ractive.subtract("foo") subtracts 1 from the value of foo', t => {
		const ractive = new Ractive({
			data: { foo: 10 }
		});

		ractive.subtract( 'foo' );
		t.equal( ractive.get( 'foo' ), 9 );

		ractive.subtract( 'foo' );
		t.equal( ractive.get( 'foo' ), 8 );
	});

	QUnit.test( 'ractive.subtract("foo",x) subtracts x from the value of foo', t => {
		const ractive = new Ractive({
			data: { foo: 10 }
		});

		ractive.subtract( 'foo', 2 );
		t.equal( ractive.get( 'foo' ), 8 );

		ractive.subtract( 'foo', 3 );
		t.equal( ractive.get( 'foo' ), 5 );
	});
}
