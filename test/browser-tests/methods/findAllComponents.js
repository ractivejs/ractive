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

		ractive.get( 'widgets' ).push( 'd' );
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
}
