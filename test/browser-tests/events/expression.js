import { test } from 'qunit';
import { fire } from 'simulant';
import { initModule } from '../test-config';

export default function() {
	initModule('event/expression.js');

	test( 'events can be handled as expressions', t => {
		const r = new Ractive({
			el: fixture,
			template: `<button on-click="@this.set('foo', 42)">click me</button>`,
			data: { foo: 'nope' }
		});
		const button = r.find( 'button' );

		simulant.fire( button, 'click' );

		t.equal( r.get( 'foo' ), 42 );
	});

	test( 'expression events can handle arguments refs', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check(arguments[0])">click me</button>`,
			data: {
				check( arg ) { t.ok( 123 === arg ); }
			}
		});

		r.getNodeInfo( 'button' ).raise( 'click', {}, 123 );
	});

	test( 'expression events can handle dollar refs', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check($1)">click me</button>`,
			data: {
				check( arg ) { t.ok( 123 === arg ); }
			}
		});

		r.getNodeInfo( 'button' ).raise( 'click', {}, 123 );
	});

	test( 'expression events can handle spread args', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check(...arguments)">click me</button>`,
			data: {
				check( arg ) { t.ok( 123 === arg ); }
			}
		});

		r.getNodeInfo( 'button' ).raise( 'click', {}, 123 );
	});

	test( 'expression events can handle argument keypath access', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check(arguments[0].original)">click me</button>`,
			data: {
				check( arg ) { t.ok( 123 === arg ); }
			}
		});

		r.getNodeInfo( 'button' ).raise( 'click', {}, { original: 123 } );
	});

	test( 'expression events can handle dollar arg keypath access', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check($1.original)">click me</button>`,
			data: {
				check( arg ) { t.ok( 123 === arg ); }
			}
		});

		r.getNodeInfo( 'button' ).raise( 'click', {}, { original: 123 } );
	});

	test( 'expression events work with complex expressions', t => {
		const r = new Ractive({
			el: fixture,
			template: `<button on-click="@this.set('foo', 42) && @this.toggle('bar')">click me</button>`
		});

		fire( r.find( 'button' ), 'click' );

		t.equal( r.get( 'foo' ), 42 );
		t.equal( r.get( 'bar' ), true );
	});

	test( 'comma-ish operator can be used with expression events', t => {
		const r = new Ractive({
			el: fixture,
			template: `<button on-click="@this.set('foo', 42), @this.toggle('bar')">click me</button>`
		});

		fire( r.find( 'button' ), 'click' );

		t.equal( r.get( 'foo' ), 42 );
		t.equal( r.get( 'bar' ), true );
	});

	test( `expression events can be used to fire by returning a single array with a string first element`, t => {
		t.expect( 4 );

		const r = new Ractive({
			target: fixture,
			template: `<button on-click="['foo', @event, 'yep', 123]">click me</button>`,
			on: {
				foo ( ev, str, num ) {
					t.equal( ev.type, 'click' );
					t.equal( this.name, 'foo' );
					t.equal( str, 'yep' );
					t.equal( num, 123 );
				}
			}
		});

		fire( r.find( 'button' ), 'click' );
	});
}
