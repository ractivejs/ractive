import { test } from 'qunit';
import { initModule } from '../test-config';

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

	test( 'ractive.findAllComponents() finds all components, of any type', function ( t ) {
		const ractive = new MockRactive({
			el: fixture,
			template: '<Widget/><Widget/><Widget/>'
		});

		const widgets = ractive.findAllComponents();

		t.equal( widgets.length, 3 );
		t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget && widgets[2] instanceof Widget );
	});

	test( 'ractive.findAllComponents(selector) finds all components of type `selector`', function ( t ) {
		const ractive = new MockRactive({
			el: fixture,
			template: '<Widget/><Decoy/><Widget/>'
		});

		const widgets = ractive.findAllComponents( 'Widget' );

		t.equal( widgets.length, 2 );
		t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget );
	});

	test( 'ractive.findAllComponents(selector, {live: true}) returns a live query that maintains sort order', function ( t ) {
		const ractive = new MockRactive({
			el: fixture,
			template: '{{#widgets}}<div><Widget content="{{this}}"/></div>{{/widgets}}',
			data: {
				widgets: [ 'a', 'b', 'c' ]
			}
		});

		const widgets = ractive.findAllComponents( 'Widget', { live: true });

		t.equal( widgets.length, 3 );
		t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget && widgets[2] instanceof Widget );
		t.equal( widgets[0].get( 'content' ), 'a' );
		t.equal( widgets[1].get( 'content' ), 'b' );
		t.equal( widgets[2].get( 'content' ), 'c' );

		ractive.push( 'widgets', 'd' );
		t.equal( widgets.length, 4 );
		t.ok( widgets[3] instanceof Widget );
		t.equal( widgets[3].get( 'content' ), 'd' );

		const widgetA = widgets[0];
		const widgetB = widgets[1];
		const widgetC = widgets[2];
		const widgetD = widgets[3];

		ractive.merge( 'widgets', [ 'c', 'a', 'd', 'b' ]);

		t.ok( widgets[0] === widgetC );
		t.ok( widgets[1] === widgetA );
		t.ok( widgets[2] === widgetD );
		t.ok( widgets[3] === widgetB );
	});

	test( 'Components containing other components work as expected with ractive.findAllComponents()', function ( t ) {
		const Compound = MockRactive.extend({
			template: '<Widget content="foo"/><div><Widget content="bar"/></div>'
		});

		const ractive = new MockRactive({
			el: fixture,
			template: '{{#shown}}<Compound/><Widget content="baz"/>{{/shown}}',
			components: { Compound }
		});

		const widgets = ractive.findAllComponents( 'Widget', { live: true });

		t.equal( widgets.length, 0 );

		ractive.set( 'shown', true );
		t.equal( widgets.length, 3 );

		ractive.set( 'shown', false );
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
			template: '{{>>anchor}}<cmp/>',
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

	test( 'live findAllComponents searches with attached children stay up to date', t => {
		fixture.innerHTML = '<div></div><div></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '{{>>anchor}}<cmp/>',
			components: {
				cmp: Ractive.extend({})
			}
		});
		const r2 = new Ractive({});
		const r3 = new Ractive({
			el: fixture.children[1],
		});

		r1.attachChild( r2, { target: 'anchor' } );
		r1.attachChild( r3 );

		const all = r1.findAllComponents( { live: true } );

		t.equal( all.length, 2 );
		t.ok( all[0] === r2 );

		r1.detachChild( r3 );
		t.equal( all.length, 2 );
		t.ok( all[0] === r2 );

		r1.detachChild( r2 );
		t.equal( all.length, 1 );

		r1.attachChild( r3 );
		t.equal( all.length, 1 );

		r1.attachChild( r2, { target: 'anchor' } );
		t.equal( all.length, 2 );
		t.ok( all[0] === r2 );
	});

	test( 'live findAllComponents searches with attached children and remotes stay up to date', t => {
		fixture.innerHTML = '<div></div><div></div>';
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '{{>>anchor}}<cmp/>',
			components: {
				cmp: Ractive.extend({})
			}
		});
		const r2 = new Ractive({});
		const r3 = new Ractive({
			el: fixture.children[1],
		});

		r1.attachChild( r2, { target: 'anchor' } );
		r1.attachChild( r3 );

		const all = r1.findAllComponents( { live: true, remote: true } );

		t.equal( all.length, 3 );
		t.ok( all[0] === r2 );
		t.ok( all[2] === r3 );

		r1.detachChild( r3 );
		t.equal( all.length, 2 );
		t.ok( all[0] === r2 );

		r1.detachChild( r2 );
		t.equal( all.length, 1 );

		r1.attachChild( r3 );
		t.equal( all.length, 2 );
		t.ok( all[1] === r3 );

		r1.attachChild( r2, { target: 'anchor' } );
		t.equal( all.length, 3 );
		t.ok( all[0] === r2 );
		t.ok( all[2] === r3 );
	});

	test( 'live queries update with deeply nested attached components correctly', t => {
		fixture.innerHTML = '<div></div><div></div>';
		const cmp = Ractive.extend({
			template: '<div class="cmp" />'
		});
		const r1 = new Ractive({
			el: fixture.children[0],
			template: '{{>>anchor}}<div id="r1" />'
		});
		const r2 = new Ractive({
			template: '<div id="r2" /><cmp />',
			components: { cmp }
		});
		const r3 = new Ractive({
			el: fixture.children[1],
			template: '<div id="r3" /><cmp />',
			components: { cmp }
		});

		r1.attachChild( r2, { target: 'anchor' } );
		r1.attachChild( r3 );

		let q1 = r1.findAllComponents( { live: true } );
		let q2 = r1.findAllComponents( { live: true, remote: true } );

		t.equal( q1.length, 2 );
		t.equal( q2.length, 4 );

		r1.detachChild( r2 );
		r1.detachChild( r3 );

		t.equal( q1.length, 0 );
		t.equal( q2.length, 0 );

		r1.attachChild( r2, { target: 'anchor' } );
		r1.attachChild( r3 );

		t.equal( q1.length, 2 );
		t.equal( q2.length, 4 );
	});
}
