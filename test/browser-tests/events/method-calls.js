/*global window */
import { test } from 'qunit';
import { fire } from 'simulant';
import { initModule } from '../test-config';

export default function() {
	initModule( 'events/method-calls.js' );

	test( 'Calling a builtin method', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `<button on-click='set("foo",foo+1)'>{{foo}}</button>`,
			data: { foo: 0 }
		});

		fire( ractive.find( 'button' ), 'click' );
		t.equal( ractive.get( 'foo' ), 1 );
		t.htmlEqual( fixture.innerHTML, '<button>1</button>' );
	});

	test( 'Calling a custom method', t => {
		t.expect( 2 );

		const Widget = Ractive.extend({
			template: `<button on-click='activate()'>{{foo}}</button>`,
			activate () {
				t.ok( true );
				t.equal( this, ractive );
			}
		});

		const ractive = new Widget({
			el: fixture
		});

		fire( ractive.find( 'button' ), 'click' );
	});

	test( 'Calling an unknown method', t => {
		const Widget = Ractive.extend({
			template: `<button on-click='activate()'>{{foo}}</button>`
		});

		const ractive = new Widget({
			el: fixture
		});

		// Catching errors inside handlers for programmatically-fired events
		// is a world of facepalm http://jsfiddle.net/geoz2tks/
		const onerror = window.onerror;
		window.onerror = function ( err ) {
			t.ok( /is not a function/.test( err ) );
			return true;
		};

		fire( ractive.find( 'button' ), 'click' );
		window.onerror = onerror;
	});

	test( 'Passing the event object to a method', t => {
		t.expect( 1 );

		const Widget = Ractive.extend({
			template: `<button on-click='activate(event)'>{{foo}}</button>`,
			activate ( event ) {
				t.equal( event.original.type, 'click' );
			}
		});

		const ractive = new Widget({
			el: fixture
		});

		fire( ractive.find( 'button' ), 'click' );
	});

	test( 'Passing a child of the event object to a method', t => {
		t.expect( 1 );

		const Widget = Ractive.extend({
			template: `<button on-click='activate(event.original.type)'>{{foo}}</button>`,
			activate ( type ) {
				t.equal( type, 'click' );
			}
		});

		const ractive = new Widget({
			el: fixture
		});

		fire( ractive.find( 'button' ), 'click' );
	});

	// Bit of a cheeky workaround...
	test( 'Passing a reference to this.event', t => {
		t.expect( 1 );

		const Widget = Ractive.extend({
			template: `<button on-click='activate(.event)'>{{foo}}</button>`,
			activate ( event ) {
				t.equal( event, 'Christmas' );
			}
		});

		const ractive = new Widget({
			el: fixture,
			data: {
				event: 'Christmas'
			}
		});

		fire( ractive.find( 'button' ), 'click' );
	});

	test( 'Current event is available to method handler as this.event (#1403)', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			el: fixture,
			template: '<button on-click="test(event)"></button>',
			test ( event ) {
				t.equal( event, this.event );
				t.equal( ractive, this );
			}
		});

		fire( ractive.find( 'button' ), 'click' );
	});

	test( 'component "on-" can call methods', t => {
		t.expect( 2 );

		const Component = Ractive.extend({
			template: `<span id="test" on-click="foo:'foo'">click me</span>`
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-foo="foo(1)" on-bar="bar(2)"/>',
			components: { Component },
			foo ( num ) {
				t.equal( num, 1 );
			},
			bar ( num ) {
				t.equal( num, 2 );
			}
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.nodes.test, 'click' );
		component.fire( 'bar', 'bar' );
	});

	test( 'component "on-" with ...arguments', t => {
		t.expect( 5 );

		const Component = Ractive.extend({
			template: `<span id="test" on-click="foo:'foo', 42">click me</span>`
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-foo="foo(...arguments)" on-bar="bar(...arguments)"/>',
			components: { Component },
			foo ( e, arg1, arg2 ) {
				t.equal( e.original.type, 'click' );
				t.equal( arg1, 'foo' );
				t.equal( arg2, 42 );
			},
			bar ( arg1, arg2 ) {
				t.equal( arg1, 'bar' );
				t.equal( arg2, 100 );
			}
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.nodes.test, 'click' );
		component.fire( 'bar', 'bar', 100 );
	});

	test( 'component "on-" with additive ...arguments', t => {
		t.expect( 7 );

		const Component = Ractive.extend({
			template: `<span id="test" on-click="foo:'foo', 42">click me</span>`
		});

		const ractive = new Ractive({
			el: fixture,
			template: `<Component on-foo="foo('fooarg', ...arguments)" on-bar="bar('bararg', ...arguments)"/>`,
			components: { Component },
			foo ( arg1, e, arg2, arg3 ) {
				t.equal( arg1, 'fooarg' );
				t.equal( e.original.type, 'click' );
				t.equal( arg2, 'foo' );
				t.equal( arg3, 42 );
			},
			bar ( arg1, arg2, arg3 ) {
				t.equal( arg1, 'bararg' );
				t.equal( arg2, 'bar' );
				t.equal( arg3, 100 );
			}
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.nodes.test, 'click' );
		component.fire( 'bar', 'bar', 100 );
	});

	test( 'component "on-" with arguments[n]', t => {
		t.expect( 5 );

		const Component = Ractive.extend({
			template: `<span id="test" on-click="foo:'foo', 42">click me</span>`
		});

		const ractive = new Ractive({
			el: fixture,
			template: `<Component on-foo="foo(arguments[2], 'qux', arguments[0])" on-bar="bar(arguments[0], 100)"/>`,
			components: { Component },
			foo ( arg1, arg2, arg3 ) {
				t.equal( arg1, 42 );
				t.equal( arg2, 'qux' );
				t.equal( arg3.original.type, 'click' );
			},
			bar ( arg1, arg2 ) {
				t.equal( arg1, 'bar' );
				t.equal( arg2, 100 );
			}
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.nodes.test, 'click' );
		component.fire( 'bar', 'bar' );
	});

	test( 'component "on-" with $n', t => {
		t.expect( 5 );

		const Component = Ractive.extend({
			template: '<span id="test" on-click="foo:\'foo\', 42">click me</span>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-foo="foo($3, \'qux\', $1)" on-bar="bar($1, 100)"/>',
			components: { Component },
			foo ( arg1, arg2, arg3 ) {
				t.equal( arg1, 42 );
				t.equal( arg2, 'qux' );
				t.equal( arg3.original.type, 'click' );
			},
			bar ( arg1, arg2 ) {
				t.equal( arg1, 'bar' );
				t.equal( arg2, 100 );
			}
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.nodes.test, 'click' );
		component.fire( 'bar', 'bar' );
	});


	test( 'preventDefault and stopPropagation if method returns false', t => {
		t.expect( 6 );

		const ractive = new Ractive({
			el: fixture,
			template: `
				<span id="return_false" on-click="returnFalse()">click me</span>
				<span id="return_undefined" on-click="returnUndefined()">click me</span>
				<span id="return_zero" on-click="returnZero()">click me</span>`,

			returnFalse () {
				t.ok( true );
				mockOriginalEvent( this.event.original );
				return false;
			},

			returnUndefined () {
				t.ok( true );
				mockOriginalEvent( this.event.original );
			},

			returnZero () {
				t.ok( true );
				mockOriginalEvent( this.event.original );
				return 0;
			}
		});

		let preventedDefault = false;
		let stoppedPropagation = false;

		function mockOriginalEvent ( original ) {
			preventedDefault = stoppedPropagation = false;
			original.preventDefault = () => preventedDefault = true;
			original.stopPropagation = () => stoppedPropagation = true;
		}

		fire( ractive.nodes.return_false, 'click' );
		t.ok( preventedDefault && stoppedPropagation );

		fire( ractive.nodes.return_undefined, 'click' );
		t.ok( !preventedDefault && !stoppedPropagation );

		fire( ractive.nodes.return_zero, 'click' );
		t.ok( !preventedDefault && !stoppedPropagation );
	});
}
