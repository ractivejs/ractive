/*global window */
import { fire } from 'simulant';
import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'events/method-calls.js' );

	test( 'Calling a builtin method', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `<button on-click='@this.set("foo",foo+1)'>{{foo}}</button>`,
			data: { foo: 0 }
		});

		fire( ractive.find( 'button' ), 'click' );
		t.equal( ractive.get( 'foo' ), 1 );
		t.htmlEqual( fixture.innerHTML, '<button>1</button>' );
	});

	test( 'Calling a custom method', t => {
		t.expect( 2 );

		const Widget = Ractive.extend({
			template: `<button on-click='@this.activate()'>{{foo}}</button>`,
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
		t.expect( 1 );

		const Widget = Ractive.extend({
			template: `<button on-click='@this.activate()'>{{foo}}</button>`
		});

		const ractive = new Widget({
			el: fixture
		});

		// Catching errors inside handlers for programmatically-fired events
		// is a world of facepalm http://jsfiddle.net/geoz2tks/
		const onerror = window.onerror;
		window.onerror = function ( err ) {
			// since expression events, the exception varies based on browser
			// so we'll say that if it throws, it was good
			t.ok( true, `${err.message} - ${err.toString()}` );
			return true;
		};

		fire( ractive.find( 'button' ), 'click' );
		window.onerror = onerror;
	});

	test( 'Passing the event object to a method', t => {
		t.expect( 1 );

		const Widget = Ractive.extend({
			template: `<button on-click='@this.activate(event)'>{{foo}}</button>`,
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
			template: `<button on-click='@this.activate(event.original.type)'>{{foo}}</button>`,
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
			template: `<button on-click='@this.activate(.event)'>{{foo}}</button>`,
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
			template: '<button on-click="@this.test(event)"></button>',
			test: function ( event ) { // eslint-disable-line object-shorthand
				t.equal( event, this.event );
				t.equal( ractive, this );
			}
		});

		fire( ractive.find( 'button' ), 'click' );
	});

	test( 'component "on-" can call methods', t => {
		t.expect( 2 );

		const Component = Ractive.extend({
			template: `<span id="test" on-click="foo">click me</span>`
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-foo="@this.foo(1)" on-bar="@this.bar(2)"/>',
			components: { Component },
			foo ( num ) {
				t.equal( num, 1 );
			},
			bar ( num ) {
				t.equal( num, 2 );
			}
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.find( '#test' ), 'click' );
		component.fire( 'bar', 'bar' );
	});

	test( 'component "on-" with ...arguments', t => {
		t.expect( 4 );

		const Component = Ractive.extend({
			template: `<span id="test" on-click="@this.fire('foo', event, "foo", 42)">click me</span>`
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-foo="@this.foo(...arguments)" on-bar="@this.bar(...arguments)"/>',
			components: { Component },
			foo ( arg1, arg2 ) {
				t.equal( arg1, 'foo' );
				t.equal( arg2, 42 );
			},
			bar ( arg1, arg2 ) {
				t.equal( arg1, 'bar' );
				t.equal( arg2, 100 );
			}
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.find( '#test' ), 'click' );
		component.fire( 'bar', 'bar', 100 );
	});

	test( 'component "on-" with additive ...arguments', t => {
		t.expect( 6 );

		const Component = Ractive.extend({
			template: `<span id="test" on-click="@this.fire('foo', event, 'foo', 42)">click me</span>`
		});

		const ractive = new Ractive({
			el: fixture,
			template: `<Component on-foo="@this.foo('fooarg', ...arguments)" on-bar="@this.bar('bararg', ...arguments)"/>`,
			components: { Component },
			foo ( arg1, arg2, arg3 ) {
				t.equal( arg1, 'fooarg' );
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
		fire( component.find( '#test' ), 'click' );
		component.fire( 'bar', 'bar', 100 );
	});

	test( 'component "on-" with arguments[n]', t => {
		t.expect( 4 );

		const Component = Ractive.extend({
			template: `<span id="test" on-click="@this.fire('foo', event, 'foo', 42)">click me</span>`
		});

		const ractive = new Ractive({
			el: fixture,
			template: `<Component on-foo="@this.foo(arguments[1], 'qux', arguments[0])" on-bar="@this.bar(arguments[0], 100)"/>`,
			components: { Component },
			foo ( arg1, arg2 ) {
				t.equal( arg1, 42 );
				t.equal( arg2, 'qux' );
			},
			bar ( arg1, arg2 ) {
				t.equal( arg1, 'bar' );
				t.equal( arg2, 100 );
			}
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.find( '#test' ), 'click' );
		component.fire( 'bar', 'bar' );
	});

	test( 'component "on-" with $n', t => {
		t.expect( 4 );

		const Component = Ractive.extend({
			template: '<span id="test" on-click="@this.fire("foo", event, "foo", 42)">click me</span>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-foo="@this.foo($2, \'qux\', $1)" on-bar="@this.bar($1, 100)"/>',
			components: { Component },
			foo ( arg1, arg2 ) {
				t.equal( arg1, 42 );
				t.equal( arg2, 'qux' );
			},
			bar ( arg1, arg2 ) {
				t.equal( arg1, 'bar' );
				t.equal( arg2, 100 );
			}
		});

		const component = ractive.findComponent( 'Component' );
		fire( component.find( '#test' ), 'click' );
		component.fire( 'bar', 'bar' );
	});


	test( 'preventDefault and stopPropagation if method returns false', t => {
		t.expect( 6 );

		const ractive = new Ractive({
			el: fixture,
			template: `
				<span id="return_false" on-click="@this.returnFalse()">click me</span>
				<span id="return_undefined" on-click="@this.returnUndefined()">click me</span>
				<span id="return_zero" on-click="@this.returnZero()">click me</span>`,

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

		fire( ractive.find( '#return_false' ), 'click' );
		t.ok( preventedDefault && stoppedPropagation );

		fire( ractive.find( '#return_undefined' ), 'click' );
		t.ok( !preventedDefault && !stoppedPropagation );

		fire( ractive.find( '#return_zero' ), 'click' );
		t.ok( !preventedDefault && !stoppedPropagation );
	});
}
