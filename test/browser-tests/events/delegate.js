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
			template: `<div>{{#each [1]}}<div on-click="ev" /><div on-click="other" />{{/each}}</div>`,
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
		t.ok( Object.keys( top._ractive.proxy.delegates ).length );
		t.ok( ev._ractive.proxy.events[0].events.length === 0 );
		t.ok( other._ractive.proxy.events[0].events.length === 0 );
		fire( top, 'click' );
		fire( ev, 'click' );
		fire( other, 'click' );
	});

	test( `delegated method event`, t => {
		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}{{#with ~/foo}}<div on-click="event.set('.bar', 42)" />{{/with}}{{/each}}</div>`,
			data: { foo: {} }
		});

		const div = r.findAll( 'div' )[1];
		simulant.fire( div, 'click' );
		t.equal( r.get( 'foo.bar' ), 42 );
	});

	test( `library delegated event cancellation`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<div on-click="nope"><div on-click="yep" /></div>{{/each}}</div>`,
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
			template: `<div>{{#each [1]}}<div on-mouseenter="yep" /><div on-mouseleave="nope" />{{/each}}</div>`,
			on: {
				nope() { t.ok( false, 'should not fire' ); },
				yep() { t.ok( true, 'should fire' ); }
			}
		});

		const yep = r.findAll( 'div' )[1];
		simulant.fire( yep, 'mouseenter' );
	});

	test( `delegated event context is correct`, t => {
		t.expect( 2 );

		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}{{#with ~/foo}}<div on-click="outer">{{#with bar}}<div on-click="inner" />{{/with}}</div>{{/with}}{{/each}}</div>`,
			data: { foo: { bar: {} } },
			on: {
				outer() { t.equal( this.resolve(), 'foo' ); },
				inner() { t.equal( this.resolve(), 'foo.bar' ); }
			}
		});

		const inner = r.findAll( 'div' )[2];
		fire( inner, 'click' );
	});

	test( `delegated events can also be raised`, t => {
		t.expect( 1 );

		const r = new Ractive({
			target: fixture,
			template: '<div>{{#each [1]}}<div on-click="yep" />{{/each}}</div>',
			on: {
				yep() { t.ok( true, 'event should fire' ); }
			}
		});

		r.getNodeInfo( r.findAll( 'div' )[1] ).raise( 'click', {} );
	});

	test( `dom events within components can also be delegated`, t => {
		const addEventListener = Element.prototype.addEventListener;
		let count = 0;
		Element.prototype.addEventListener = function () {
			count++;
			return addEventListener.apply( this, arguments );
		};
		const cmp = Ractive.extend({
			template: `<div on-click="ev" /><div on-click="other" />`
		});
		const r = new Ractive({
			target: fixture,
			template: `<div>{{#each [1]}}<cmp />{{/each}}</div>`,
			on: {
				'*.ev'() {
					t.ok( true, 'event fired' );
				},
				'*.other'() {
					t.ok( true, 'other event fired' );
				}
			},
			components: { cmp }
		});

		t.equal( count, 1 );
		Element.prototype.addEventListener = addEventListener;

		const [ top, ev, other ] = r.findAll( 'div' );
		t.ok( Object.keys( top._ractive.proxy.delegates ).length );
		t.ok( ev._ractive.proxy.events[0].events.length === 0 );
		t.ok( other._ractive.proxy.events[0].events.length === 0 );
		fire( top, 'click' );
		fire( ev, 'click' );
		fire( other, 'click' );
	});

	test( `delegation can be turned off`, t => {
		const addEventListener = Element.prototype.addEventListener;
		let count = 0;
		Element.prototype.addEventListener = function () {
			count++;
			return addEventListener.apply( this, arguments );
		};

		const cmp = Ractive.extend({
			template: `<div on-click="ev" /><div on-click="other" />`
		});
		const r = new Ractive({
			target: fixture,
			delegate: false,
			template: `<div>{{#each arr}}<div on-click="outer" /><cmp />{{/each}}</div>`,
			components: { cmp },
			data: { arr: [ 1 ] }
		});

		t.equal( count, 3 );
		Element.prototype.addEventListener = addEventListener;

		const [ top, outer, ev, other ] = r.findAll( 'div' );
		t.ok( !top._ractive.proxy.delegates );
		t.ok( outer._ractive.proxy.events[0].events.length === 1 );
		t.ok( ev._ractive.proxy.events[0].events.length === 1 );
		t.ok( other._ractive.proxy.events[0].events.length === 1 );
	});

	test( `delegation can be turned off for specific elements with no-delegation`, t => {
		const addEventListener = Element.prototype.addEventListener;
		let count = 0;
		Element.prototype.addEventListener = function () {
			count++;
			return addEventListener.apply( this, arguments );
		};

		const cmp = Ractive.extend({
			template: `<div>{{#each [1]}}<div on-click="ev" /><div on-click="other" />{{/each}}</div>`
		});
		const r = new Ractive({
			target: fixture,
			template: `<div no-delegation>{{#each arr}}<div on-click="outer" /><cmp />{{/each}}</div>`,
			components: { cmp },
			data: { arr: [ 1 ] }
		});

		t.equal( count, 2 );
		Element.prototype.addEventListener = addEventListener;

		const [ top, outer, , ev, other ] = r.findAll( 'div' );
		t.ok( top._ractive.proxy.delegate === false );
		t.ok( !top._ractive.proxy.delegates );
		t.ok( outer._ractive.proxy.events[0].events.length === 1 );
		t.ok( ev._ractive.proxy.events[0].events.length === 0 );
		t.ok( other._ractive.proxy.events[0].events.length === 0 );
	});
}
