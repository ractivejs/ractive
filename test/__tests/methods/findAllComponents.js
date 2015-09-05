const Widget = Ractive.extend({
	template: '<p>{{content}}</p>'
});

const Decoy = Ractive.extend({
	template: '<p>I am a decoy</p>'
});

const MockRactive = Ractive.extend({
	components: {
		widget: Widget,
		decoy: Decoy
	}
});

test( 'ractive.findAllComponents() finds all components, of any type', function ( t ) {
	var ractive, widgets;

	ractive = new MockRactive({
		el: fixture,
		template: '<widget/><widget/><widget/>'
	});

	widgets = ractive.findAllComponents();

	t.equal( widgets.length, 3 );
	t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget && widgets[2] instanceof Widget );
});

test( 'ractive.findAllComponents(selector) finds all components of type `selector`', function ( t ) {
	var ractive, widgets;

	ractive = new MockRactive({
		el: fixture,
		template: '<widget/><decoy/><widget/>'
	});

	widgets = ractive.findAllComponents( 'widget' );

	t.equal( widgets.length, 2 );
	t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget );
});

test( 'ractive.findAllComponents(selector, {live: true}) returns a live query that maintains sort order', function ( t ) {
	var ractive, widgets, widgetA, widgetB, widgetC, widgetD;

	ractive = new MockRactive({
		el: fixture,
		template: '{{#widgets}}<div><widget content="{{this}}"/></div>{{/widgets}}',
		data: {
			widgets: [ 'a', 'b', 'c' ]
		}
	});

	widgets = ractive.findAllComponents( 'widget', { live: true });

	t.equal( widgets.length, 3 );
	t.ok( widgets[0] instanceof Widget && widgets[1] instanceof Widget && widgets[2] instanceof Widget );
	t.equal( widgets[0].get( 'content' ), 'a' );
	t.equal( widgets[1].get( 'content' ), 'b' );
	t.equal( widgets[2].get( 'content' ), 'c' );

	ractive.get( 'widgets' ).push( 'd' );
	t.equal( widgets.length, 4 );
	t.ok( widgets[3] instanceof Widget );
	t.equal( widgets[3].get( 'content' ), 'd' );

	widgetA = widgets[0];
	widgetB = widgets[1];
	widgetC = widgets[2];
	widgetD = widgets[3];

	ractive.merge( 'widgets', [ 'c', 'a', 'd', 'b' ]);

	t.ok( widgets[0] === widgetC );
	t.ok( widgets[1] === widgetA );
	t.ok( widgets[2] === widgetD );
	t.ok( widgets[3] === widgetB );
});

test( 'Components containing other components work as expected with ractive.findAllComponents()', function ( t ) {
	var Compound, ractive, widgets;

	Compound = MockRactive.extend({
		template: '<widget content="foo"/><div><widget content="bar"/></div>'
	});

	ractive = new MockRactive({
		el: fixture,
		template: '{{#shown}}<compound/><widget content="baz"/>{{/shown}}',
		components: {
			compound: Compound
		}
	});

	widgets = ractive.findAllComponents( 'widget', { live: true });

	t.equal( widgets.length, 0 );

	ractive.set( 'shown', true );
	t.equal( widgets.length, 3 );

	ractive.set( 'shown', false );
	t.equal( widgets.length, 0 );
});
