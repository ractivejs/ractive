import { test } from 'qunit';
import { initModule, beforeEach } from '../test-config';
import { fire } from 'simulant';

export default function() {
	let Component;
	let Middle;
	let Subclass;

	beforeEach( () => {
		Component = Ractive.extend({
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		Middle = Ractive.extend({
			template: '<Component/>'
		});

		Subclass = Ractive.extend({
			template: '<Middle/>',
			components: { Component, Middle }
		});
	});

	initModule( 'events/bubbling.js' );

	function shouldNotFire () {
		throw new Error( 'This event should not fire' );
	}

	function notOnOriginating () {
		throw new Error( 'Namespaced event should not fire on originating component' );
	}

	function shouldBeNoBubbling () {
		throw new Error( 'Event bubbling should not have happened' );
	}

	[
		{
			type: 'proxy events',
			callback: component => fire( component.nodes.test, 'click' ),
			verify: event => event.get()
		},

		{
			type: 'programmatic events',
			callback: component => component.fire( 'someEvent', 'foo' ),
			verify: arg => arg === 'foo'
		}
	].forEach( ({ type, callback, verify }) => {
		test( `Events bubble under "eventname", and also "Component.eventname" above firing component (${type})`, t => {
			t.expect( 3 );

			const ractive = new Subclass({ el: fixture });
			const middle = ractive.findComponent( 'Middle' );
			const component = ractive.findComponent( 'Component' );

			component.on( 'someEvent', arg => t.ok( verify( arg ) ) );
			component.on( 'Component.someEvent', notOnOriginating );

			middle.on( 'someEvent', shouldNotFire );
			middle.on( 'Component.someEvent', arg => t.ok( verify( arg ) ) );

			ractive.on( 'someEvent', shouldNotFire );
			ractive.on( 'Component.someEvent', arg => t.ok( verify( arg ) ) );

			callback( ractive.findComponent( 'Component' ) );
		});

		test( `arguments bubble (${type})`, t => {
			t.expect( 3 );

			Component.prototype.template = '<span id="test" on-click="@this.fire("someEvent", event, "foo")">click me</span>';

			const ractive = new Subclass({ el: fixture });
			const middle = ractive.findComponent( 'Middle' );
			const component = ractive.findComponent( 'Component' );

			component.on( 'someEvent', arg => t.ok( verify( arg ) ) );
			component.on( 'Component.someEvent', notOnOriginating );

			middle.on( 'someEvent', shouldNotFire );
			middle.on( 'Component.someEvent', arg => t.ok( verify( arg ) ) );

			ractive.on( 'someEvent', shouldNotFire );
			ractive.on( 'Component.someEvent', arg => t.ok( verify( arg ) ) );

			callback( ractive.findComponent( 'Component' ) );
		});

		test( `bubbling events can be stopped by returning false (${type})`, t => {
			t.expect( 2 );

			const ractive = new Subclass({ el: fixture });
			const middle = ractive.findComponent( 'Middle' );
			const component = ractive.findComponent( 'Component' );

			component.on( 'someEvent', event => t.ok( verify( event ) ) );
			component.on( 'Component.someEvent', notOnOriginating );

			middle.on( 'Component.someEvent', () => false );
			// still fires on same level
			middle.on( 'Component.someEvent', event => t.ok( verify( event ) ) );

			ractive.on( 'Component.someEvent', () => {
				throw new Error( 'Event bubbling should not have happened' );
			});

			callback( ractive.findComponent( 'Component' ) );
		});

		test( `bubbling events with event object have component reference (${type})`, t => {
			t.expect( 3 );

			const ractive = new Subclass({ el: fixture });
			const middle = ractive.findComponent( 'Middle' );
			const component = ractive.findComponent( 'Component' );

			function hasComponentRef ( event ) {
				event.original ? t.equal( event.component, component ) : t.ok( true );
			}

			component.on( 'someEvent', event => {
				t.ok( !event.component );
			});
			middle.on( 'Component.someEvent', hasComponentRef );
			ractive.on( 'Component.someEvent', hasComponentRef );

			callback( ractive.findComponent( 'Component' ) );
		});
	});

	test( 'bubbling handlers can use pattern matching', t => {
		t.expect( 4 );

		const Component = Ractive.extend({
			template: '<span id="test" on-click="foo">click me</span>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component/>',
			components: { Component }
		});

		ractive.on( '*.*', () => t.ok( true ) );
		ractive.on( 'Component.*', () => t.ok( true ) );
		ractive.on( '*.foo', () => t.ok( true ) );
		ractive.on( 'Component.foo', () => t.ok( true ) );

		const component = ractive.findComponent( 'Component' );
		fire( component.nodes.test, 'click' );

		// otherwise we get cross test failure due to "teardown" event
		// because we're reusing fixture element
		ractive.off();
	});

	test( 'component "on-someEvent" implicitly cancels bubbling', t => {
		t.expect( 1 );

		const Component = Ractive.extend({
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-someEvent="foo"/>',
			components: { Component }
		});

		ractive.on( 'foo', () => t.ok( true ) );
		ractive.on( 'Component.someEvent', shouldBeNoBubbling );

		const component = ractive.findComponent( 'Component' );
		fire( component.nodes.test, 'click' );
	});

	test( 'component "on-" wildcards match', t => {
		t.expect( 3 );

		const Component = Ractive.extend({
			template: '<span id="test" on-click="foo.bar">click me</span>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-foo.*="foo" on-*.bar="bar" on-*.*="both"/>',
			components: { Component }
		});

		ractive.on( 'foo', () => t.ok( true ) );
		ractive.on( 'bar', () => t.ok( true ) );
		ractive.on( 'both', () => t.ok( true ) );

		const component = ractive.findComponent( 'Component' );
		fire( component.nodes.test, 'click' );
	});

	test( 'component "on-" do not get auto-namespaced events', t => {
		t.expect( 1 );

		const Component = Ractive.extend({
			template: '<span id="test" on-click="someEvent">click me</span>'
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Component on-Component.someEvent="foo"/>',
			components: { Component }
		});

		ractive.on( 'foo', shouldNotFire);

		const component = ractive.findComponent( 'Component' );
		fire( component.nodes.test, 'click' );
		t.ok( true );
	});

	test( 'firing an event from an event directive cancels bubble if the sub-event also cancels', t => {
		t.expect( 0 );

		const r = new Ractive({
			el: fixture,
			template: `<div on-click="@this.fire('no')"><button on-click="@this.fire('go')">click</button></div>`,
		});

		r.on( 'no', () => t.ok( false, 'the event bubbled' ) );
		r.on( 'go', () => false );

		fire( r.find( 'button' ), 'click' );
	});
}
