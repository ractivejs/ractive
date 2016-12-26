import { test } from 'qunit';
import { fire } from 'simulant';
import { initModule } from '../../helpers/test-config';

export default function() {
	initModule('event/expression.js');

	test( 'events can be handled as expressions', t => {
		const r = new Ractive({
			el: fixture,
			template: `<button on-click="@this.set('foo', 42)">click me</button>`,
			data: { foo: 'nope' }
		});
		const button = r.find( 'button' );

		fire( button, 'click' );

		t.equal( r.get( 'foo' ), 42 );
	});

	test( 'expression events can handle arguments refs', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check(arguments[0])">click me</button>`,
			data: {
				check( arg ) { t.ok( this.event === arg ); }
			}
		});

		fire( r.find( 'button' ), 'click' );
	});

	test( 'expression events can handle dollar refs', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check($1)">click me</button>`,
			data: {
				check( arg ) { t.ok( this.event === arg ); }
			}
		});

		fire( r.find( 'button' ), 'click' );
	});

	test( 'expression events can handle spread args', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check(...arguments)">click me</button>`,
			data: {
				check( arg ) { t.ok( this.event === arg ); }
			}
		});

		fire( r.find( 'button' ), 'click' );
	});

	test( 'expression events can handle argument keypath access', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check(arguments[0].original)">click me</button>`,
			data: {
				check( arg ) { t.ok( this.event.original === arg ); }
			}
		});

		fire( r.find( 'button' ), 'click' );
	});

	test( 'expression events can handle dollar arg keypath access', t => {
		t.expect(1);

		const r = new Ractive({
			el: fixture,
			template: `<button on-click=".check($1.original)">click me</button>`,
			data: {
				check( arg ) { t.ok( this.event.original === arg ); }
			}
		});

		fire( r.find( 'button' ), 'click' );
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
