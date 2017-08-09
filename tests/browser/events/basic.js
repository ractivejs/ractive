import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';
import { fire } from 'simulant';

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

	test( `events also initially fire in the implicit this namespace`, t => {
		let thisFoo = 0;
		let starFoo = 0;
		let justFoo = 0;
		let starStar = 0;
		let star = 0;

		const r = new Ractive();

		r.on( 'this.foo', () => thisFoo++ );
		r.on( '*.foo', () => starFoo++ );
		r.on( 'foo', () => justFoo++ );
		r.on( '*', () => star++ );
		// implicit this namespace doesn't trigger *.* for non-breakage purposes with lifecycle events
		r.on( '*.*', () => starStar++ );

		r.fire( 'foo' );

		t.equal( thisFoo, 1 );
		t.equal( starFoo, 1 );
		t.equal( justFoo, 1 );
		t.equal( starStar, 0 );
		t.equal( star, 1 );
	});

	test( `events that bubble drop the this namespace on their way up`, t => {
		const cmp = Ractive.extend();
		const r = new Ractive({
			target: fixture,
			template: '<cmp />',
			components: { cmp }
		});

		let starFoo = 0;
		let starStarFoo = 0;

		r.on( '*.foo', () => starFoo++ );
		r.on( '*.*.foo', () => starStarFoo++ );

		r.findComponent().fire( 'foo' );

		t.equal( starFoo, 1 );
		t.equal( starStarFoo, 0 );
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

	test( `hyphens in event names can be escaped`, t => {
		const cmp = Ractive.extend();
		const r = new Ractive({
			target: fixture,
			template: `<cmp on-foo\\-bar-baz="@.set('foo', 'yep')" />`,
			components: { cmp }
		});

		r.findComponent( 'cmp' ).fire( 'foo-bar' );
		t.equal( r.get( 'foo' ), 'yep' );

		r.set( 'foo', 'nope' );
		r.findComponent( 'cmp' ).fire( 'baz' );
		t.equal( r.get( 'foo' ), 'yep' );
	});

	test( `events can be silenced and resumed`, t => {
		let count = 0;
		const r = new Ractive();
		const handle = r.on( 'foo', function ( ctx, num ) {
			t.equal( num, 1 );
			t.ok( this === r );
			count++;
		});

		r.fire( 'foo', 1 );
		t.equal( count, 1 );

		handle.silence();
		r.fire( 'foo', 1 );
		t.equal( count, 1 );
		t.equal( handle.isSilenced(), true );

		handle.resume();
		r.fire( 'foo', 1 );
		t.equal( count, 2 );
		t.equal( handle.isSilenced(), false );
	});

	test( `event handle cancels all events when multiple events are subscribed`, t => {
		let count = 0;
		const r = new Ractive();
		const obj = r.on({
			foo() { count++; },
			bar() { count++; },
			'baz bat': () => count++
		});
		const space = r.on( 'foo baz', () => count++ );

		r.fire( 'foo' );
		t.equal( count, 2 );

		r.fire( 'baz' );
		t.equal( count, 4 );

		space.cancel();
		r.fire( 'foo' );
		t.equal( count, 5 );

		obj.cancel();
		r.fire( 'bar' );
		t.equal( count, 5 );
	});

	test( `using the same event callback function for different events or multiple times doesn't break (#2922)`, t => {
		let count = 0;
		function handler() {
			count++;
		}

		const r = new Ractive();

		const foo = r.on( 'foo', handler );
		r.on( 'bar', handler );
		const multi = r.on( 'baz bat bip.bop', handler );

		r.fire( 'foo' );
		r.fire( 'bar' );
		r.fire( 'baz' );
		r.fire( 'bat' );
		r.fire( 'bip.bop' );

		t.equal( count, 5 );

		foo.cancel();
		r.off( 'bar', handler );

		r.fire( 'foo' );
		r.fire( 'bar' );
		r.fire( 'baz' );
		r.fire( 'bat' );
		r.fire( 'bip.bop' );

		t.equal( count, 8 );

		multi.cancel();
		r.on( 'foo', handler );
		r.on( 'bar', handler );

		r.fire( 'foo' );
		r.fire( 'bar' );
		r.fire( 'baz' );
		r.fire( 'bat' );
		r.fire( 'bip.bop' );

		t.equal( count, 10 );
	});

	test( `firing a pojo first arg extends context (#3033)`, t => {
		t.expect( 6 );

		const r = new Ractive();
		class Foo {}

		r.on( 'foo', ( ctx, foo ) => {
			t.ok( foo instanceof Foo );
			t.ok( ctx.set ); // is still a context
		});

		r.on( 'merge', ctx => {
			t.ok( ctx.foo instanceof Foo );
			t.ok( ctx.set ); // is still a context
		});

		r.on( 'str', ( ctx, foo ) => {
			t.ok( foo === 'foo' );
			t.ok( ctx.set ); // is still a context
		});

		r.fire( 'foo', new Foo() );
		r.fire( 'merge', { foo: new Foo() } );
		r.fire( 'str', 'foo' );
	});

	test( `extending context from a proxy fire uses the source event (#3033)`, t => {
		t.expect( 5 );

		const cmp = Ractive.extend({
			template: `{{#with test.path}}<button on-click="@.fire('foo', { bar: true }, 'test')" />{{/with}}`,
			data () { return { test: { path: {} } }; }
		});
		const r = new Ractive({
			target: fixture,
			components: { cmp },
			template: `<cmp on-foo="bar" />`,
			on: {
				bar ( ctx, str ) {
					t.equal( ctx.resolve(), '' );
					t.ok( ctx.bar );
					t.strictEqual( this.findComponent( 'cmp' ), ctx.ractive );
					t.equal( str, 'test' );
					t.equal( ctx.name, 'bar' );
				}
			}
		});


		fire( r.find( 'button' ), 'click' );
	});

	test( `event directives subscribe as deferred tasks (#3050)`, t => {
		let c1 = 0;
		let c2 = 0;

		function check ( node ) {
			const handle = () => c1++;
			node.addEventListener( 'click', handle );
			return {
				teardown () {
					node.removeEventListener( 'click', handle );
				}
			};
		}

		const cmp = Ractive.extend({
			template: '{{#if first}}<button as-check on-click="check" />{{/if}}',
			decorators: { check },
			on: {
				check () { this.toggle( 'first' ); c2++; }
			},
			data () { return { first: true }; }
		});

		const r = new Ractive({
			template: '<cmp />',
			components: { cmp },
			target: fixture
		});

		fire( r.find( 'button' ), 'click' );

		t.ok( c1 === 1 && c2 === 1 );
	});
}
