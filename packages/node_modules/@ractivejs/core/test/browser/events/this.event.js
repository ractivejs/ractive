import { fire } from 'simulant';
import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'events/this.event.js' );

	test( 'this.event set to current event object', t => {
		t.expect( 1 );

		const ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="foo"/>'
		});

		ractive.on( 'foo', function ( event ) {
			t.equal( this.event, event );
		});

		fire( ractive.find( '#test' ), 'click' );
	});

	test( 'this.event exists on ractive.fire()', t => {
		t.expect( 2 );

		const ractive = new Ractive({
			el: fixture,
			template: '<span id="test" on-click="foo"/>',
			data: { foo: 'bar' }
		});

		ractive.on( 'foo', function () {
			const e = this.event;
			t.ok( e );
			t.equal( e.name, 'foo' );
		});

		ractive.fire( 'foo' );
	});

	test( 'method calls that fire events do not clobber this.events', t => {
		t.expect( 4 );

		let methodEvent;

		const ractive = new Ractive({
			el: fixture,
			template: `<span id='test' on-click='@this.inTheater()'></span>`,
			inTheater () {
				t.ok ( methodEvent = this.event, 'method call has event' );
				this.fire( 'yell' );
				t.equal( this.event, methodEvent, 'method event is same after firing event' );
			}
		});

		ractive.on( 'yell', function () {
			t.notEqual( this.event, methodEvent, 'handler does not have method event' );
			t.equal ( this.event.name, 'yell', 'handler as own event name' );
		});

		fire( ractive.find( '#test' ), 'click' );
	});
}
