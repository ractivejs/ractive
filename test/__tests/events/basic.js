import { test } from 'qunit';

test( 'sharing names with array mutator functions doesn\'t break events', t => {
	const eventNames = ['sort', 'reverse', 'push', 'pop', 'shift', 'unshift', 'fhtagn']; // the last one just tests the test
	let results = new Object( null );

	t.expect( eventNames.length );

	const ractive = new Ractive({
		el: fixture,
		template: ''
	});

	eventNames.forEach( eventName => {
		ractive.on( eventName, () => results[eventName] = true );
		ractive.fire( eventName );
		t.ok( typeof( results[eventName] ) != 'undefined', `Event '${eventName}' did not fire.` );
	});
});

test( 'Empty event names are safe, though do not fire', t => {
	var ractive = new Ractive();

	t.expect( 1 );
	ractive.on( '', () => {
		throw new Error( 'Empty event name should not fire' );
	});
	ractive.fire( '' );
	t.ok( true );
});

test( 'Calling ractive.off() without a keypath removes all handlers', t => {
	var ractive = new Ractive({
		el: fixture,
		template: 'doesn\'t matter'
	});

	t.expect( 0 );

	ractive.on({
		foo: function () {
			t.ok( false );
		},
		bar: function () {
			t.ok( false );
		},
		baz: function () {
			t.ok( false );
		}
	});

	ractive.off();

	ractive.fire( 'foo' );
	ractive.fire( 'bar' );
	ractive.fire( 'baz' );
});

test( 'Multiple space-separated events can be handled with a single callback (#731)', t => {
	var ractive, count = 0;

	ractive = new Ractive({});

	ractive.on( ' foo bar  baz', () => count += 1 );

	ractive.fire( 'foo' );
	t.equal( count, 1 );

	ractive.fire( 'bar' );
	t.equal( count, 2 );

	ractive.fire( 'baz' );
	t.equal( count, 3 );

	ractive.off( ' bar  foo ' );

	ractive.fire( 'foo' );
	t.equal( count, 3 );

	ractive.fire( 'bar' );
	t.equal( count, 3 );

	ractive.fire( 'baz' );
	t.equal( count, 4 );
});

test( 'ractive.off() is chainable (#677)', t => {
	var ractive, returnedValue;

	ractive = new Ractive();
	returnedValue = ractive.off('foo');

	t.equal( returnedValue, ractive );
});
