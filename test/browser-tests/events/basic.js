import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'events/basic.js' );

	test( 'sharing names with array mutator functions doesn\'t break events', t => {
		const eventNames = ['sort', 'reverse', 'push', 'pop', 'shift', 'unshift', 'fhtagn']; // the last one just tests the test
		const results = new Object( null );

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
		const ractive = new Ractive();

		t.expect( 1 );
		ractive.on( '', () => {
			throw new Error( 'Empty event name should not fire' );
		});
		ractive.fire( '' );
		t.ok( true );
	});

	test( 'Calling ractive.off() without a keypath removes all handlers', t => {
		const ractive = new Ractive({
			el: fixture,
			template: 'doesn\'t matter'
		});

		t.expect( 0 );

		ractive.on({
			foo () {
				t.ok( false );
			},
			bar () {
				t.ok( false );
			},
			baz () {
				t.ok( false );
			}
		});

		ractive.off();

		ractive.fire( 'foo' );
		ractive.fire( 'bar' );
		ractive.fire( 'baz' );
	});

	test( 'Multiple space-separated events can be handled with a single callback (#731)', t => {
		const ractive = new Ractive({});
		let count = 0;

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
		const ractive = new Ractive();
		const returnedValue = ractive.off( 'foo' );

		t.equal( returnedValue, ractive );
	});

	test( 'handlers can use pattern matching', t => {
		t.expect( 4 );

		const ractive = new Ractive();

		ractive.on( '*.*', () => t.ok( true ) );
		ractive.on( 'some.*', () => t.ok( true ) );
		ractive.on( '*.event', () => t.ok( true ) );
		ractive.on( 'some.event', () => t.ok( true ) );

		ractive.fire( 'some.event' );
	});

	test( '.once() event functionality', t => {
		t.expect( 1 );

		const ractive = new Ractive( {} );

		ractive.once( 'foo bar', () => {
			t.ok( true );
		});

		ractive.fire( 'foo' );
		ractive.fire( 'foo' );
		ractive.fire( 'bar' );
	});

	test( 'wildcard and multi-part listeners have correct event name', t => {
		const ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="foo"/>'
		});

		const fired = [];

		ractive.on( 'foo.* fuzzy *.bop', function () {
			fired.push( this.event.name );
		});

		const events = [ 'foo.bar', 'fuzzy', 'foo.fizz', 'bip.bop' ];
		events.forEach( ractive.fire.bind( ractive ) );

		t.deepEqual( fired, events );
	});

	test( 'Inflight unsubscribe works (#1504)', t => {
		t.expect( 3 );

		const ractive = new Ractive( {} );

		function first () {
			t.ok( true );
			ractive.off( 'foo', first );
		}

		ractive.on( 'foo', first );

		ractive.on( 'foo', () => {
			t.ok( true );
		});

		ractive.fire( 'foo' );
		ractive.fire( 'foo' );
	});
}
