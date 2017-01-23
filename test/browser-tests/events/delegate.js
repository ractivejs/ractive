import { test } from 'qunit';
import { initModule } from '../test-config';
import { fire } from 'simulant';

export default function() {
	initModule( 'events/delegate.js' );

	test( `basic delegation`, t => {
		t.expect( 6 );

		const addEventListener = Element.prototype.addEventListener;
		let count = 0;
		Element.prototype.addEventListener = function () {
			count++;
			return addEventListener.apply( this, arguments );
		};
		const r = new Ractive({
			target: fixture,
			template: `<div delegate-click><div delegate-click="ev" /><div delegate-click="other" /></div>`,
			on: {
				ev() {
					t.ok( true, 'event fired' );
				},
				other() {
					t.ok( true, 'other event fired' );
				}
			}
		});

		t.equal( count, 1 );
		Element.prototype.addEventListener = addEventListener;

		const [ top, ev, other ] = r.findAll( 'div' );
		t.ok( top._ractive.proxy.events.length );
		t.ok( ev._ractive.proxy.delegates.length );
		t.ok( other._ractive.proxy.delegates.length );
		fire( top, 'click' );
		fire( ev, 'click' );
		fire( other, 'click' );
	});

	test( `library delegated event cancellation`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `<div delegate-click><div delegate-click="nope"><div delegate-click="yep" /></div></div>`,
			on: {
				nope() { t.ok( false, 'should not fire' ); },
				yep() { t.ok( true, 'should fire' ); return false; }
			}
		});

		const yep = r.findAll( 'div' )[2];
		fire( yep, 'click' );
	});

	test( `multiple delegated events don't interfere with each other`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `<div delegate-mouseenter-mouseleave><div delegate-mouseenter="yep" /><div delegate-mouseleave="nope" /></div>`,
			on: {
				nope() { t.ok( false, 'should not fire' ); },
				yep() { t.ok( true, 'should fire' ); }
			}
		});

		const yep = r.findAll( 'div' )[1];
		simulant.fire( yep, 'mouseenter' );
	});
}
