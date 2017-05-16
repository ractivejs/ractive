import { fire } from 'simulant';
import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

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
				check( arg ) { t.ok( 'foo' === arg ); }
			}
		});

		r.getContext( 'button' ).raise( 'click', {}, 'foo' );
	});

	test( 'expression events can handle dollar refs', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check($1)">click me</button>`,
			data: {
				check( arg ) { t.ok( 'foo' === arg ); }
			}
		});

		r.getContext( 'button' ).raise( 'click', {}, 'foo' );
	});

	test( 'expression events can handle spread args', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check(...arguments)">click me</button>`,
			data: {
				check( arg ) { t.ok( 'foo' === arg ); }
			}
		});

		r.getContext( 'button' ).raise( 'click', {}, 'foo' );
	});

	test( 'expression events can handle argument keypath access', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check(arguments[0].length)">click me</button>`,
			data: {
				check( arg ) { t.ok( 3 === arg ); }
			}
		});

		r.getContext( 'button' ).raise( 'click', {}, 'foo' );
	});

	test( 'expression events can handle dollar arg keypath access', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check($1.length)">click me</button>`,
			data: {
				check( arg ) { t.ok( 3 === arg ); }
			}
		});

		r.getContext( 'button' ).raise( 'click', {}, 'foo' );
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
}
