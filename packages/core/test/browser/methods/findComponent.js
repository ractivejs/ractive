import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/findComponent.js' );

	const Widget = Ractive.extend({
		template: '<p>{{content}}</p>'
	});

	const Decoy = Ractive.extend({
		template: '<p>I am a decoy</p>'
	});

	const MockRactive = Ractive.extend({
		components: { Widget, Decoy }
	});

	test( 'ractive.findComponent() finds the first component, of any type', ( t ) => {
		const ractive = new MockRactive({
			el: fixture,
			template: '{{{ covered }}}<Widget/>',
			data: { covered: '<span />' }
		});

		const widget = ractive.findComponent();

		t.ok( widget instanceof Widget );
	});

	test( 'ractive.findComponent(selector) finds the first component of type `selector`', ( t ) => {
		const ractive = new MockRactive({
			el: fixture,
			template: '<Decoy/><Widget/>'
		});

		const widget = ractive.findComponent( 'Widget' );

		t.ok( widget instanceof Widget );
	});

	test( 'findComponent and findAllComponents work through {{>content}}', t => {
		const Component = Ractive.extend({});
		const Wrapper = Ractive.extend({
			template: '<p>{{>content}}</p>',
			components: { Component }
		});

		const ractive = new Ractive({
			el: fixture,
			template: '<Wrapper><Component/></Wrapper>',
			components: { Wrapper, Component }
		});

		const find = ractive.findComponent( 'Component' );
		const findAll = ractive.findAllComponents( 'Component' );

		t.ok( find, 'component not found' );
		t.equal( findAll.length, 1);
	});

	test( 'findComponent finds non-targeted attached children last when asked', t => {
		const cmp = Ractive.extend({});
		const r = new Ractive({
			el: fixture,
			template: `{{#if show}}<cmp />{{/if}}`,
			data: { show: true },
			components: { cmp }
		});

		const r2 = new cmp();
		r.attachChild( r2, { name: 'cmp' } );

		let res = r.findComponent( { remote: true } );
		t.ok( res && res !== r2 );

		res = r.findComponent( 'cmp', { remote: true } );
		t.ok( res && res !== r2 );

		r.set( 'show', false );
		res = r.findComponent( { remote: true } );
		t.ok( res && res === r2 );

		res = r.findComponent( 'cmp', { remote: true } );
		t.ok( res && res === r2 );
	});

	test( 'findComponent finds targeted attached children in template order', t => {
		const cmp = Ractive.extend({});
		const r = new Ractive({
			el: fixture,
			template: `{{#if show}}<#foo />{{/if}}<cmp />`,
			data: { show: false },
			components: { cmp }
		});

		const r2 = new cmp();
		r.attachChild( r2, { target: 'foo', name: 'cmp' } );

		let res = r.findComponent( 'cmp' );
		t.ok( res && res !== r2 );

		r.set( 'show', true );
		res = r.findComponent( 'cmp' );
		t.ok( res && res === r2 );
	});

	test( 'findComponent finds anchored components by anchor name when the instance has no name', t => {
		const cmp = new Ractive();
		const r = new Ractive({
			el: fixture,
			template: '<#foo />'
		});

		r.attachChild( cmp, { target: 'foo' } );
		t.ok( r.findComponent( 'foo' ) === cmp, 'same instance' );
	});

	test( 'findComponent finds anchored components by given name when the instance has one', t => {
		const cmp = new Ractive();
		const r = new Ractive({
			el: fixture,
			template: '<#foo />'
		});

		r.attachChild( cmp, { target: 'foo', name: 'bar' } );
		t.ok( r.findComponent( 'bar' ) === cmp, 'same instance' );
		t.ok( r.findComponent( 'foo' ) === undefined, 'no instance' );
	});
}
