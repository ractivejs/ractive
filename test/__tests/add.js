module( 'add/subtract' );

test( 'ractive.add("foo") adds 1 to the value of foo', t => {
	let ractive = new Ractive({
		data: { foo: 0 }
	});

	ractive.add( 'foo' );
	t.equal( ractive.get( 'foo' ), 1 );

	ractive.add( 'foo' );
	t.equal( ractive.get( 'foo' ), 2 );
});

test( 'ractive.add("foo",x) adds x to the value of foo', t => {
	let ractive = new Ractive({
		data: { foo: 0 }
	});

	ractive.add( 'foo', 2 );
	t.equal( ractive.get( 'foo' ), 2 );

	ractive.add( 'foo', 3 );
	t.equal( ractive.get( 'foo' ), 5 );
});

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

test( 'non-numeric values are an error', t => {
	let ractive = new Ractive({
		data: { foo: 'potato' }
	});

	t.throws( () => ractive.add( 'foo' ), /Cannot add to a non-numeric value/ );
});

test( 'each keypath that matches a wildcard is added to individually (#1604)', t => {
	let items = [
		{ count: 1 },
		{ count: 2 },
		{ count: 3 }
	];

	let ractive = new Ractive({
		data: { items }
	});

	ractive.add( 'items[*].count', 3 );

	t.equal( ractive.get( 'items[0].count' ), 4 );
	t.equal( ractive.get( 'items[1].count' ), 5 );
	t.equal( ractive.get( 'items[2].count' ), 6 );

	ractive.subtract( 'items[*].count', 2 );

	t.equal( ractive.get( 'items[0].count' ), 2 );
	t.equal( ractive.get( 'items[1].count' ), 3 );
	t.equal( ractive.get( 'items[2].count' ), 4 );
});