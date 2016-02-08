import { test } from 'qunit';

test( 'ractive.subtract("foo") subtracts 1 from the value of foo', t => {
	let ractive = new Ractive({
		data: { foo: 10 }
	});

	ractive.subtract( 'foo' );
	t.equal( ractive.get( 'foo' ), 9 );

	ractive.subtract( 'foo' );
	t.equal( ractive.get( 'foo' ), 8 );
});

test( 'ractive.subtract("foo",x) subtracts x from the value of foo', t => {
	let ractive = new Ractive({
		data: { foo: 10 }
	});

	ractive.subtract( 'foo', 2 );
	t.equal( ractive.get( 'foo' ), 8 );

	ractive.subtract( 'foo', 3 );
	t.equal( ractive.get( 'foo' ), 5 );
});

test( 'subtract supports context with decrement', t => {
	const r = new Ractive({
		el: fixture,
		template: `{{#with foo.bar}}<span></span>{{/with}}`,
		data: { foo: { bar: { baz: 10 } } }
	});

	r.subtract( '.baz', 5, r.find( 'span' ) );
	t.equal( r.get( 'foo.bar.baz' ), 5 );
});

test( 'subtract supports context without decrement', t => {
	const r = new Ractive({
		el: fixture,
		template: `{{#with foo.bar}}<span></span>{{/with}}`,
		data: { foo: { bar: { baz: 10 } } }
	});

	r.subtract( '.baz', r.find( 'span' ) );
	t.equal( r.get( 'foo.bar.baz' ), 9 );
});
