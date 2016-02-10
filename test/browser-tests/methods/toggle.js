import { test } from 'qunit';

test( 'ractive.toggle("foo") toggles the value of foo', t => {
	let ractive = new Ractive({
		data: { foo: false }
	});

	ractive.toggle( 'foo' );
	t.ok( ractive.get( 'foo' ) );

	ractive.toggle( 'foo' );
	t.ok( !ractive.get( 'foo' ) );
});

test( 'non-boolean values are effectively coerced', t => {
	let ractive = new Ractive({
		data: {
			foo: null,
			bar: 0,
			baz: 'str'
		}
	});

	ractive.toggle( 'foo' );
	ractive.toggle( 'bar' );
	ractive.toggle( 'baz' );
	ractive.toggle( 'qux' );

	t.ok(  ractive.get( 'foo' ) );
	t.ok(  ractive.get( 'bar' ) );
	t.ok( !ractive.get( 'baz' ) );
	t.ok(  ractive.get( 'qux' ) );
});

test( 'each keypath that matches a wildcard is toggled individually (#1604)', t => {
	let items = [
		{ active: true },
		{ active: false },
		{ active: true }
	];

	let ractive = new Ractive({
		data: { items }
	});

	ractive.toggle( 'items[*].active' );

	t.ok( !ractive.get( 'items[0].active' ) );
	t.ok(  ractive.get( 'items[1].active' ) );
	t.ok( !ractive.get( 'items[2].active' ) );
});

test( 'toggle supports toggling keypaths with context', t => {
	const r = new Ractive({
		el: fixture,
		template: `{{#with foo.bar}}<span></span>{{/with}}`,
		data: { foo: { bar: { baz: false } } }
	});

	r.toggle( '.baz', r.find( 'span' ) );
	t.ok( r.get( 'foo.bar.baz' ) );
});
