/*global window */
import { test } from 'qunit';
import { fire } from 'simulant';

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
		t.ok( /Attempted to call a non-existent method \(\"activate\"\)/.test( err ) );
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
