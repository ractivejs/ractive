import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/findAllComponents.js' );

	const Widget = Ractive.extend({
		template: '<p>{{content}}</p>'
	});

	const Decoy = Ractive.extend({
		template: '<p>I am a decoy</p>'
	});

	const MockRactive = Ractive.extend({
		components: { Widget, Decoy }
	});

	test( 'ractive.findAllComponents() finds all components, of any type', ( t ) => {
		const ractive = new MockRactive({
			el: fixture,
			template: '{{{ covered }}}<Widget/><Widget/><Widget/>',
			data: { covered: '<span />' }
		});

		const widgets = ractive.findAllComponents();

		t.equal( widgets.length, 3 );
		t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget && widgets[2] instanceof Widget );
	});

	test( 'ractive.findAllComponents(selector) finds all components of type `selector`', ( t ) => {
		const ractive = new MockRactive({
			el: fixture,
			template: '<Widget/><Decoy/><Widget/>'
		});

		const widgets = ractive.findAllComponents( 'Widget' );

		t.equal( widgets.length, 2 );
		t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget );
	});

	test( 'Components containing other components work as expected with ractive.findAllComponents()', ( t ) => {
		const Compound = MockRactive.extend({
			template: '<Widget content="foo"/><div><Widget content="bar"/></div>'
		});

		const ractive = new MockRactive({
			el: fixture,
			template: '{{#shown}}<Compound/><Widget content="baz"/>{{/shown}}',
			components: { Compound }
		});

		let widgets = ractive.findAllComponents( 'Widget' );

		t.equal( widgets.length, 0 );

		ractive.set( 'shown', true );
		widgets = ractive.findAllComponents( 'Widget' );
		t.equal( widgets.length, 3 );

		ractive.set( 'shown', false );
		widgets = ractive.findAllComponents( 'Widget' );
		t.equal( widgets.length, 0 );
	});

	test( 'findAllComponents searches non-targeted attached children, when asked, last', t => {
		fixture.innerHTML = '<div></div><div></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '<cmp />',
			components: {
				cmp: Ractive.extend({})
			}
		});
		const r2 = new Ractive({
			el: fixture.children[1]
		});

		r1.attachChild( r2 );

		const all = r1.findAllComponents( { remote: true } );

		t.equal( all.length, 2 );
		t.ok( all[1] === r2 );
	});

	test( 'findAllComponents searches targeted attached children in order', t => {
		const r1 = new Ractive({
			el: fixture,
			template: '<#anchor /><cmp/>',
			components: {
				cmp: Ractive.extend({})
			}
		});
		const r2 = new Ractive({});

		r1.attachChild( r2, { target: 'anchor' } );

		const all = r1.findAllComponents();

		t.equal( all.length, 2 );
		t.ok( all[0] === r2 );
	});

	test( 'findAllComponents finds anchored components by anchor name when there is no instance name', t => {
		const cmp1 = new Ractive();
		const cmp2 = new Ractive();
		const r = new Ractive({
			el: fixture,
			template: '<# foo /><# bar />'
		});

		r.attachChild( cmp2, { target: 'foo' } );
		r.attachChild( cmp1, { target: 'bar' } );
		t.ok( r.findAllComponents( 'foo' )[0] === cmp2, 'same instance' );
		t.ok( r.findAllComponents( 'bar' )[0] === cmp1, 'same instance' );
	});

	test( 'findAllComponents finds anchored components by instance name when available', t => {
		const cmp1 = new Ractive();
		const cmp2 = new Ractive();
		const r = new Ractive({
			el: fixture,
			template: '<#foo /><#bar />'
		});

		r.attachChild( cmp2, { target: 'foo', name: 'baz' } );
		r.attachChild( cmp1, { target: 'bar', name: 'bat' } );
		t.ok( r.findAllComponents( 'foo' )[0] === undefined, 'no instance' );
		t.ok( r.findAllComponents( 'bar' )[0] === undefined, 'no instance' );
		t.ok( r.findAllComponents( 'baz' )[0] === cmp2, 'same instance' );
		t.ok( r.findAllComponents( 'bat' )[0] === cmp1, 'same instance' );
	});
}
